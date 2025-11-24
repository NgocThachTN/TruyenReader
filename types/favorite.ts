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
