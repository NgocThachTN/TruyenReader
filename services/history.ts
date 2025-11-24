import { ChapterInfo, ComicDetailItem } from "../types/types";
import { getImageUrl } from "./api";

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

const HISTORY_KEY = "truyen_history";
const MAX_HISTORY_ITEMS = 50;

export const getHistory = (): HistoryItem[] => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Failed to load history", error);
    return [];
  }
};

export const addToHistory = (
  comic: ComicDetailItem,
  chapter: ChapterInfo,
  domain: string,
  page: number = 0
) => {
  try {
    const history = getHistory();
    
    const newItem: HistoryItem = {
      comicId: comic._id,
      comicName: comic.name,
      comicSlug: comic.slug,
      comicThumb: getImageUrl(domain, comic.thumb_url),
      chapterName: chapter.chapter_name,
      chapterApiData: chapter.chapter_api_data,
      lastReadAt: Date.now(),
      lastPage: page,
    };

    const filteredHistory = history.filter((item) => item.comicSlug !== comic.slug);
    const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save history", error);
  }
};

export const removeFromHistory = (comicSlug: string) => {
  try {
    const history = getHistory();
    const newHistory = history.filter((item) => item.comicSlug !== comicSlug);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (error) {
    console.error("Failed to remove history item", error);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};
