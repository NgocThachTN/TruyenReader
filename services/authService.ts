import { API_BASE_URL } from "./config";

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_KEY = "user";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PersistSessionPayload extends AuthTokens {
  user?: unknown;
}

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
};

const dispatchAuthEvents = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new CustomEvent("user:updated"));
};

export const getAccessToken = (): string | null => {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
};

export const getRefreshToken = (): string | null => {
  return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
};

export const setTokens = (tokens: AuthTokens) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  dispatchAuthEvents();
};

export const persistAuthSession = (payload: PersistSessionPayload) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  if (payload.user) {
    storage.setItem(USER_KEY, JSON.stringify(payload.user));
  }
  dispatchAuthEvents();
};

export const clearAuthSession = () => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
  storage.removeItem(USER_KEY);
  dispatchAuthEvents();
};

export const getStoredUser = () => {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse stored user", error);
    return null;
  }
};

export const ensureAccessToken = () => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Bạn cần đăng nhập để thực hiện chức năng này");
  }
  return token;
};

export const buildAuthHeaders = (headers?: HeadersInit) => {
  const combined = new Headers(headers || {});
  const token = getAccessToken();
  if (token) {
    combined.set("Authorization", `Bearer ${token}`);
  }
  return combined;
};

let refreshPromise: Promise<AuthTokens> | null = null;

const requestTokenRefresh = async (): Promise<AuthTokens> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Không thể làm mới phiên làm việc. Vui lòng đăng nhập lại."
    );
  }

  const tokens: AuthTokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken || refreshToken,
  };
  setTokens(tokens);
  return tokens;
};

export const refreshAccessToken = (): Promise<AuthTokens> => {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

export const fetchWithAutoRefresh = async (
  requestFn: () => Promise<Response>
): Promise<Response> => {
  let response = await requestFn();

  if (response.status !== 401) {
    return response;
  }

  try {
    await refreshAccessToken();
  } catch (error) {
    clearAuthSession();
    throw error;
  }

  response = await requestFn();

  if (response.status === 401) {
    clearAuthSession();
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  return response;
};

