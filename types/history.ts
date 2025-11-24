export interface HistoryItem {
  comicId: string;
  comicName: string;
  comicSlug: string;
  comicThumb: string;
  chapterName: string;
  chapterApiData: string;
  lastReadAt: number;
  lastPage?: number;
}
