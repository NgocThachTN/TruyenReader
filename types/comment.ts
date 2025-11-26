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
    userId: number;
    fullname: string;
    avatar?: string;
    isOnline?: boolean;
  };
}

export interface CommentsResponse {
  comments: CommentItem[];
}
