import { HomeResponse, DetailResponse, ChapterResponse, SearchResponse, CategoryListResponse, CategoryDetailResponse } from '../types';

const BASE_URL = 'https://otruyenapi.com/v1/api';

export const fetchHomeData = async (): Promise<HomeResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/home`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching home data:", error);
    throw error;
  }
};

export const fetchComicDetail = async (slug: string): Promise<DetailResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/truyen-tranh/${slug}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching comic detail:", error);
    throw error;
  }
};

export const searchComics = async (keyword: string): Promise<SearchResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching comics:", error);
    throw error;
  }
};

export const fetchCategories = async (): Promise<CategoryListResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/the-loai`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const fetchComicsByCategory = async (slug: string, page: number = 1): Promise<CategoryDetailResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/the-loai/${slug}?page=${page}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching comics by category:", error);
    throw error;
  }
};

export const fetchComicList = async (slug: string, page: number = 1): Promise<CategoryDetailResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/danh-sach/${slug}?page=${page}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching comic list:", error);
    throw error;
  }
};

export const fetchChapterData = async (apiUrl: string): Promise<ChapterResponse> => {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to load chapter');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching chapter:", error);
        throw error;
    }
}

export const getImageUrl = (domain: string, path: string): string => {
    return `${domain}/uploads/comics/${path}`;
}