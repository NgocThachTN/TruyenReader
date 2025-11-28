import { ChapterInfo, ComicDetailItem } from "../types/types";
import { HistoryItem } from "../types/history";
import { getImageUrl } from "./api";
import {
  buildAuthHeaders,
  fetchWithAutoRefresh,
  getAccessToken,
} from "./authService";

const API_BASE_URL = "https://nodejs-test-api-o7bd.onrender.com/api";
const HISTORY_KEY = "truyen_history";

// Helper to get local history (fallback)
const getLocalHistory = (): HistoryItem[] => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

// Helper to save local history (fallback)
const saveLocalHistory = (history: HistoryItem[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  const hasToken = !!getAccessToken();

  if (hasToken) {
    try {
      const response = await fetchWithAutoRefresh(() =>
        fetch(`${API_BASE_URL}/reading-history`, {
          headers: buildAuthHeaders(),
        })
      );

      if (response.ok) {
        const data = await response.json();
        console.log("GET history raw data:", data);

        let historyList: any[] = [];
        if (Array.isArray(data)) {
          historyList = data;
        } else if (Array.isArray(data.histories)) {
          // Updated: check for 'histories' key based on user feedback
          historyList = data.histories;
        } else if (Array.isArray(data.readingHistory)) {
          historyList = data.readingHistory;
        } else if (Array.isArray(data.data)) {
          historyList = data.data;
        } else if (data.data && Array.isArray(data.data.readingHistory)) {
          historyList = data.data.readingHistory;
        } else if (data.items && Array.isArray(data.items)) {
          historyList = data.items;
        }

        console.log("Parsed history list:", historyList);

        return historyList.map((item: any) => {
          let chapterName = item.currentChapter || "";
          let chapterApiData = "";

          if (chapterName && chapterName.includes("::")) {
            const parts = chapterName.split("::");
            chapterName = parts[0];
            chapterApiData = parts.slice(1).join("::");
          }

          return {
            comicId: item.comicId,
            comicName: item.comicName,
            comicSlug: item.comicSlug,
            comicThumb: item.comicThumb,
            chapterName: chapterName,
            chapterApiData: chapterApiData,
            lastReadAt: item.updatedAt
              ? new Date(item.updatedAt).getTime()
              : Date.now(),
          };
        });
      } else {
        console.error("API history fetch failed, falling back to local");
      }
    } catch (error) {
      console.error("API history error, falling back to local", error);
    }
  }

  // Fallback to local storage if no token or API failed
  return getLocalHistory();
};

export const addToHistory = async (
  comic: ComicDetailItem,
  chapter: ChapterInfo,
  domain: string,
  page: number = 0
) => {
  const hasToken = !!getAccessToken();
  const currentChapterValue = `${chapter.chapter_name}::${chapter.chapter_api_data}`;

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

  // 1. Always update Local Storage (for immediate UI feedback + offline support)
  try {
    const history = getLocalHistory();
    const filteredHistory = history.filter(
      (item) => item.comicSlug !== comic.slug
    );
    const newHistory = [newItem, ...filteredHistory].slice(0, 50);
    saveLocalHistory(newHistory);
  } catch (e) {
    console.error("Local history save failed", e);
  }

  // 2. If logged in, sync to API
  if (hasToken) {
    try {
      const payload = {
        comicId: comic._id,
        comicSlug: comic.slug,
        comicName: comic.name,
        comicThumb: getImageUrl(domain, comic.thumb_url),
        currentChapter: currentChapterValue,
      };

      console.log("Saving history payload:", payload);

      const payloadJson = JSON.stringify(payload);
      const response = await fetchWithAutoRefresh(() =>
        fetch(`${API_BASE_URL}/reading-history`, {
          method: "POST",
          headers: buildAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: payloadJson,
        })
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to save history to API:",
          response.status,
          errorText
        );
      } else {
        const resJson = await response.json();
        console.log("Save history API success:", resJson);
      }
    } catch (error) {
      console.error("Failed to save history to API", error);
    }
  } else {
    console.warn("User not logged in, history saved to local only");
  }
};

export const removeFromHistory = async (comicSlug: string) => {
  const hasToken = !!getAccessToken();

  // 1. Remove from Local Storage
  try {
    const history = getLocalHistory();
    const newHistory = history.filter((item) => item.comicSlug !== comicSlug);
    saveLocalHistory(newHistory);
  } catch (e) {
    console.error("Local history remove failed", e);
  }

  // 2. Remove from API if logged in
  if (hasToken) {
    try {
      const response = await fetchWithAutoRefresh(() =>
        fetch(`${API_BASE_URL}/reading-history/${comicSlug}`, {
          method: "DELETE",
          headers: buildAuthHeaders(),
        })
      );

      if (!response.ok) {
        console.error("Failed to delete history item API:", response.status);
      }
    } catch (error) {
      console.error("Failed to remove history item API", error);
    }
  }

  // Return current state (prefer API if available, else local)
  return await getHistory();
};

export const clearHistory = async () => {
  // 1. Clear Local
  localStorage.removeItem(HISTORY_KEY);

  // 2. Clear API
  const hasToken = !!getAccessToken();
  if (hasToken) {
    const history = await getHistory();
    // Note: This might be slow if there are many items, but API lacks clear-all
    const deletePromises = history.map((item) =>
      fetchWithAutoRefresh(() =>
        fetch(`${API_BASE_URL}/reading-history/${item.comicSlug}`, {
          method: "DELETE",
          headers: buildAuthHeaders(),
        })
      ).catch((error) => {
        console.error("Failed to clear history item", item.comicSlug, error);
      })
    );
    await Promise.all(deletePromises);
  }
};
