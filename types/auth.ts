export interface RegisterData {
  email: string;
  password: string;
  confirmpassword: string;
  fullname: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface FavoriteData {
  comicId: string;
  comicName: string;
  comicThumb: string;
  comicSlug: string;
}

export interface FavoriteItem extends FavoriteData {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface FavoritesResponse {
  favorites: FavoriteItem[];
}

export interface CommentData {
  comicId: string;
  comicSlug: string;
  content: string;
}

export interface CommentItem {
  id: number;
  userId: number;
  comicId: string;
  comicSlug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    fullname: string;
  };
}

export interface CommentsResponse {
  comments: CommentItem[];
}
