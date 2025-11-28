import {
  RegisterData,
  LoginData,
  ChangePasswordData,
  ForgotPasswordData,
  VerifyOtpData,
  ResetPasswordData,
} from "../types/auth";
import { FavoriteData, FavoritesResponse } from "../types/favorite";
import { CommentData, CommentsResponse } from "../types/comment";
import {
  ProfileResponse,
  ProfileUpdatePayload,
  ProfileUserResponse,
} from "../types/profile";
import { API_BASE_URL } from "./config";
import {
  buildAuthHeaders,
  ensureAccessToken,
  fetchWithAutoRefresh,
  getRefreshToken,
  clearAuthSession,
  getAccessToken,
} from "./authService";

export { API_BASE_URL };

const parseJsonResponse = async <T>(
  response: Response,
  defaultMessage: string
): Promise<T> => {
  const data = (await response.json().catch(() => ({}))) as any;
  if (!response.ok) {
    throw new Error(data?.message || defaultMessage);
  }
  return data as T;
};

export interface AuthSuccessResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    userId: number;
    email: string;
    fullname?: string;
    avatar?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export const registerUser = async (data: RegisterData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await parseJsonResponse(response, "Registration failed");
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (data: LoginData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await parseJsonResponse<AuthSuccessResponse>(response, "Login failed");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  if (!refreshToken || !accessToken) {
    clearAuthSession();
    return { message: "Đăng xuất thành công" };
  }

  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ refreshToken }),
      })
    );

    const data = await parseJsonResponse(response, "Đăng xuất thất bại");
    clearAuthSession();
    return data;
  } catch (error) {
    clearAuthSession();
    throw error;
  }
};

export const addToFavorites = async (data: FavoriteData) => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/favorites`, {
        method: "POST",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
      })
    );

    return await parseJsonResponse(response, "Failed to add to favorites");
  } catch (error) {
    console.error("Add to favorites error:", error);
    throw error;
  }
};

export const getFavorites = async (): Promise<FavoritesResponse> => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/favorites`, {
        method: "GET",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
      })
    );

    return await parseJsonResponse<FavoritesResponse>(
      response,
      "Failed to fetch favorites"
    );
  } catch (error) {
    console.error("Get favorites error:", error);
    throw error;
  }
};

export const removeFromFavorites = async (comicId: string) => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/favorites/${comicId}`, {
        method: "DELETE",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
      })
    );

    return await parseJsonResponse(response, "Failed to remove from favorites");
  } catch (error) {
    console.error("Remove from favorites error:", error);
    throw error;
  }
};

export const getComments = async (
  comicSlug: string
): Promise<CommentsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${comicSlug}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch comments");
    }

    return await response.json();
  } catch (error) {
    console.error("Get comments error:", error);
    throw error;
  }
};

export const addComment = async (data: CommentData) => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
      })
    );

    return await parseJsonResponse(response, "Failed to add comment");
  } catch (error) {
    console.error("Add comment error:", error);
    throw error;
  }
};

export const changePassword = async (data: ChangePasswordData) => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
      })
    );

    return await parseJsonResponse(response, "Đổi mật khẩu thất bại");
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

export const forgotPassword = async (data: ForgotPasswordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gửi email thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

export const verifyOtp = async (data: VerifyOtpData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Xác nhận OTP thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("Verify OTP error:", error);
    throw error;
  }
};

export const resetPassword = async (data: ResetPasswordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Đặt lại mật khẩu thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

export const getProfile = async (): Promise<ProfileResponse> => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
      })
    );

    return await parseJsonResponse<ProfileResponse>(
      response,
      "Không thể lấy thông tin hồ sơ"
    );
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
};

export const getUserProfileById = async (
  userId: number
): Promise<ProfileResponse> => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: "GET",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
      })
    );

    return await parseJsonResponse<ProfileResponse>(
      response,
      "Không thể lấy thông tin hồ sơ người dùng"
    );
  } catch (error) {
    console.error("Get user profile by id error:", error);
    throw error;
  }
};

export const updateProfile = async (
  payload: ProfileUpdatePayload
): Promise<ProfileUserResponse> => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      })
    );

    return await parseJsonResponse<ProfileUserResponse>(
      response,
      "Cập nhật hồ sơ thất bại"
    );
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

export const uploadAvatar = async (
  file: File
): Promise<ProfileUserResponse> => {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    ensureAccessToken();
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/profile`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: formData,
      })
    );

    return await parseJsonResponse<ProfileUserResponse>(
      response,
      "Tải ảnh đại diện thất bại"
    );
  } catch (error) {
    console.error("Upload avatar error:", error);
    throw error;
  }
};

export const sendChatMessage = async (receiverId: number, message: string) => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/chat/send`, {
        method: "POST",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ receiverId, message }),
      })
    );

    return await parseJsonResponse(response, "Gửi tin nhắn thất bại");
  } catch (error) {
    console.error("Send chat message error:", error);
    throw error;
  }
};

export const markChatMessagesAsRead = async (senderId: number) => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/chat/mark-read/${senderId}`, {
        method: "PUT",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
      })
    );

    return await parseJsonResponse(response, "Không thể đánh dấu đã đọc");
  } catch (error) {
    console.error("Mark chat messages as read error:", error);
    throw error;
  }
};

export interface ConversationUser {
  userId: number;
  fullname: string;
  avatar?: string;
}

export interface ConversationLastMessage {
  messageId: number;
  senderId: number;
  receiverId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationItem {
  user: ConversationUser;
  lastMessage: ConversationLastMessage | null;
  unreadCount: number;
}

export interface ConversationsResponse {
  conversations: ConversationItem[];
}

export interface OnlineUserItem {
  userId: number;
  fullname: string;
  email: string;
  avatar?: string;
}

export interface OnlineUsersResponse {
  onlineUsers: OnlineUserItem[];
}

export const getConversations = async (): Promise<ConversationsResponse> => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
      })
    );

    return await parseJsonResponse<ConversationsResponse>(
      response,
      "Không thể tải danh sách cuộc trò chuyện"
    );
  } catch (error) {
    console.error("Get conversations error:", error);
    throw error;
  }
};

export const getChatMessagesWithUser = async (userId: number) => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/chat/messages/${userId}`, {
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
      })
    );

    return await parseJsonResponse(
      response,
      "Không thể tải tin nhắn cuộc trò chuyện"
    );
  } catch (error) {
    console.error("Get chat messages error:", error);
    throw error;
  }
};

export const getOnlineUsers = async (): Promise<OnlineUsersResponse> => {
  ensureAccessToken();
  try {
    const response = await fetchWithAutoRefresh(() =>
      fetch(`${API_BASE_URL}/chat/online-users`, {
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
      })
    );

    return await parseJsonResponse<OnlineUsersResponse>(
      response,
      "Không thể tải danh sách user đang online"
    );
  } catch (error) {
    console.error("Get online users error:", error);
    throw error;
  }
};
