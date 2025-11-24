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
