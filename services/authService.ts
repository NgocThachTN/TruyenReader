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

const notifySessionExpired = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
};

let expiryTimer: number | null = null;

const clearExpiryTimer = () => {
  if (typeof window === "undefined") return;
  if (expiryTimer) {
    window.clearTimeout(expiryTimer);
    expiryTimer = null;
  }
};

const scheduleExpiryCheck = (token: string) => {
  if (typeof window === "undefined") return;
  clearExpiryTimer();
  try {
    const [, payload] = token.split(".");
    if (!payload) return;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    const exp = decoded?.exp;
    if (!exp) return;
    const delay = exp * 1000 - Date.now();
    if (delay <= 0) {
      notifySessionExpired();
      return;
    }
    expiryTimer = window.setTimeout(() => {
      notifySessionExpired();
    }, delay);
  } catch (error) {
    console.warn("Failed to schedule token expiry notification", error);
  }
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
  scheduleExpiryCheck(tokens.accessToken);
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
  scheduleExpiryCheck(payload.accessToken);
  dispatchAuthEvents();
};

export const clearAuthSession = () => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
  storage.removeItem(USER_KEY);
  clearExpiryTimer();
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
    notifySessionExpired();
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
    notifySessionExpired();
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
    notifySessionExpired();
    throw error;
  }

  response = await requestFn();

  if (response.status === 401) {
    clearAuthSession();
    notifySessionExpired();
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  return response;
};
