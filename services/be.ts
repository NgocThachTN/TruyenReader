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

export const API_BASE_URL = "https://nodejs-test-api-o7bd.onrender.com/api";

export const registerUser = async (data: RegisterData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registration failed");
    }

    return await response.json();
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const addToFavorites = async (data: FavoriteData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Bạn cần đăng nhập để thực hiện chức năng này");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to add to favorites");
    }

    return await response.json();
  } catch (error) {
    console.error("Add to favorites error:", error);
    throw error;
  }
};

export const getFavorites = async (): Promise<FavoritesResponse> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Bạn cần đăng nhập để xem danh sách yêu thích");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch favorites");
    }

    return await response.json();
  } catch (error) {
    console.error("Get favorites error:", error);
    throw error;
  }
};

export const removeFromFavorites = async (comicId: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Bạn cần đăng nhập để thực hiện chức năng này");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${comicId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to remove from favorites");
    }

    return await response.json();
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
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Bạn cần đăng nhập để bình luận");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to add comment");
    }

    return await response.json();
  } catch (error) {
    console.error("Add comment error:", error);
    throw error;
  }
};

export const changePassword = async (data: ChangePasswordData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Bạn cần đăng nhập để đổi mật khẩu");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Đổi mật khẩu thất bại");
    }

    return await response.json();
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

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Bạn cần đăng nhập để thực hiện chức năng này");
  }
  return token;
};

export const getProfile = async (): Promise<ProfileResponse> => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể lấy thông tin hồ sơ");
    }

    return await response.json();
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
};

export const getUserProfileById = async (
  userId: number
): Promise<ProfileResponse> => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Không thể lấy thông tin hồ sơ người dùng"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Get user profile by id error:", error);
    throw error;
  }
};

export const updateProfile = async (
  payload: ProfileUpdatePayload
): Promise<ProfileUserResponse> => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Cập nhật hồ sơ thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

export const uploadAvatar = async (
  file: File
): Promise<ProfileUserResponse> => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Tải ảnh đại diện thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload avatar error:", error);
    throw error;
  }
};

export const sendChatMessage = async (receiverId: number, message: string) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ receiverId, message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gửi tin nhắn thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("Send chat message error:", error);
    throw error;
  }
};

export const markChatMessagesAsRead = async (senderId: number) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}/chat/mark-read/${senderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể đánh dấu đã đọc");
    }

    return await response.json();
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
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Không thể tải danh sách cuộc trò chuyện"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Get conversations error:", error);
    throw error;
  }
};

export const getChatMessagesWithUser = async (userId: number) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}/chat/messages/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Không thể tải tin nhắn cuộc trò chuyện"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Get chat messages error:", error);
    throw error;
  }
};

export const getOnlineUsers = async (): Promise<OnlineUsersResponse> => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}/chat/online-users`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Không thể tải danh sách user đang online"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Get online users error:", error);
    throw error;
  }
};
