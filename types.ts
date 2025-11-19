// API Response Types

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface ChapterLatest {
  filename: string;
  chapter_name: string;
  chapter_title: string;
  chapter_api_data: string;
}

export interface ComicItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string[];
  status: string;
  thumb_url: string;
  sub_docquyen: boolean;
  category: Category[];
  updatedAt: string;
  chaptersLatest: ChapterLatest[];
}

export interface SeoOnPage {
  titleHead: string;
  descriptionHead: string;
  og_type: string;
  og_image: string[];
}

export interface HomeData {
  seoOnPage: SeoOnPage;
  items: ComicItem[];
  APP_DOMAIN_CDN_IMAGE: string;
}

export interface HomeResponse {
  status: string;
  message: string;
  data: HomeData;
}

// Detail Types

export interface ChapterInfo {
  filename: string;
  chapter_name: string;
  chapter_title: string;
  chapter_api_data: string;
}

export interface ServerData {
  server_name: string;
  server_data: ChapterInfo[];
}

export interface ComicDetailItem extends ComicItem {
  content: string;
  author: string[];
  chapters: ServerData[];
}

export interface DetailData {
  seoOnPage: SeoOnPage;
  breadCrumb: any[];
  params: any;
  item: ComicDetailItem;
  APP_DOMAIN_CDN_IMAGE: string;
}

export interface DetailResponse {
  status: string;
  message: string;
  data: DetailData;
}

export interface SearchData {
  seoOnPage: SeoOnPage;
  breadCrumb: any[];
  titlePage: string;
  items: ComicItem[];
  params: {
    keyword: string;
    page: string;
  };
  type_list: string;
  APP_DOMAIN_CDN_IMAGE: string;
}

export interface SearchResponse {
  status: string;
  message: string;
  data: SearchData;
}

// Chapter API Response (Inferred from standard OTruyen structure)
export interface ChapterImage {
    image_page: number;
    image_file: string;
}

export interface ChapterDetailItem {
    chapter_path: string;
    chapter_image: ChapterImage[];
}

export interface ChapterData {
    domain_cdn: string;
    item: ChapterDetailItem;
}

export interface ChapterResponse {
    status: string;
    data: ChapterData;
}

export interface CategoryListData {
  items: Category[];
}

export interface CategoryListResponse {
  status: string;
  message: string;
  data: CategoryListData;
}

export interface CategoryDetailData {
  seoOnPage: SeoOnPage;
  breadCrumb: any[];
  titlePage: string;
  items: ComicItem[];
  params: {
    type_slug: string;
    pagination: {
      totalItems: number;
      totalItemsPerPage: number;
      currentPage: number;
      pageRanges: number;
    };
  };
  type_list: string;
  APP_DOMAIN_CDN_IMAGE: string;
}

export interface CategoryDetailResponse {
  status: string;
  message: string;
  data: CategoryDetailData;
}