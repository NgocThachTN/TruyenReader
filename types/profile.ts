import { FavoriteItem } from "./favorite";

export interface ProfileUser {
  userId: number;
  email: string;
  fullname: string;
  role: string;
  avatar?: string;
  avatarVersion?: number;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingHistoryItem {
  id: number;
  userId: number;
  comicId: string;
  comicSlug: string;
  comicName: string;
  comicThumb: string;
  currentChapter: string;
  lastReadAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  user: ProfileUser;
  favorites: FavoriteItem[];
  readingHistory: ReadingHistoryItem[];
}

export interface ProfileUpdatePayload {
  fullname: string;
  email: string;
}

export interface ProfileUserResponse {
  user: ProfileUser;
  message?: string;
}
