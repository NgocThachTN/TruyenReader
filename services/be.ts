import {
  RegisterData,
  LoginData,
  ChangePasswordData,
} from "../types/auth";
import { FavoriteData, FavoritesResponse } from "../types/favorite";
import { CommentData, CommentsResponse } from "../types/comment";

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
