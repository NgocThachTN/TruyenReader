import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchChapterData, fetchComicDetail } from "../services/api";
import { ChapterData, ComicDetailItem, ChapterInfo } from "../types";
import Spinner from "../components/Spinner";
import { addToHistory } from "../services/history";

const ChapterViewer: React.FC = () => {
  const { slug, apiUrl } = useParams<{ slug: string; apiUrl: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ChapterData | null>(null);
  const [comic, setComic] = useState<ComicDetailItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDomain, setImageDomain] = useState<string>("");

  // Reading State
  const [readingMode, setReadingMode] = useState<"scroll" | "single">("scroll");
  const [currentPage, setCurrentPage] = useState(0);

  // Navigation State
  const [prevChapter, setPrevChapter] = useState<ChapterInfo | null>(null);
  const [nextChapter, setNextChapter] = useState<ChapterInfo | null>(null);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);

  // UI State
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (readingMode === "single") return;

      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowNav(false);
        setIsChapterListOpen(false);
      } else {
        setShowNav(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [readingMode]);

  useEffect(() => {
    if (!apiUrl) return;

    const loadChapter = async () => {
      // Only set loading true if we don't have data yet (initial load)
      // or if we want to show a spinner between chapters.
      // For smoother transition, we might keep showing old content until new is ready,
      // but standard behavior is to show loading.
      setLoading(true);
      setError(null);
      try {
        const decodedUrl = decodeURIComponent(apiUrl);

        // 1. Fetch Chapter Data
        const chapterResult = await fetchChapterData(decodedUrl);
        setData(chapterResult.data);
        setCurrentPage(0);

        // 2. Fetch Comic Details
        if (slug && (!comic || comic.slug !== slug)) {
          const comicResult = await fetchComicDetail(slug);
          setComic(comicResult.data.item);
          setImageDomain(comicResult.data.APP_DOMAIN_CDN_IMAGE);
        }
      } catch (err) {
        setError("Không thể tải ảnh chương.");
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, slug]);

  useEffect(() => {
    if (comic && apiUrl && imageDomain) {
      const decodedUrl = decodeURIComponent(apiUrl);
      const allChapters = comic.chapters[0]?.server_data || [];
      const currentChapter = allChapters.find(
        (c) => c.chapter_api_data === decodedUrl
      );

      if (currentChapter) {
        addToHistory(comic, currentChapter, imageDomain);
      }
    }
  }, [comic, apiUrl, imageDomain]);

  useEffect(() => {
    if (!comic || !apiUrl) return;

    const decodedUrl = decodeURIComponent(apiUrl);
    const allChapters = comic.chapters[0]?.server_data || [];

    // Sort chapters: newest (largest number) to oldest (smallest number)
    allChapters.sort(
      (a, b) => parseFloat(b.chapter_name) - parseFloat(a.chapter_name)
    );

    const currentIndex = allChapters.findIndex(
      (c) => c.chapter_api_data === decodedUrl
    );

    if (currentIndex !== -1) {
      setNextChapter(allChapters[currentIndex - 1] || null);
      setPrevChapter(allChapters[currentIndex + 1] || null);
    }
  }, [comic, apiUrl]);

  const handleChapterChange = (chapter: ChapterInfo) => {
    if (chapter && slug) {
      navigate(
        `/chapter/${slug}/${encodeURIComponent(chapter.chapter_api_data)}`
      );
      window.scrollTo(0, 0);
      setIsChapterListOpen(false);
    }
  };

  const handlePageChange = useCallback(
    (direction: "next" | "prev") => {
      if (!data) return;
      const totalPages = data.item.chapter_image.length;

      if (direction === "next") {
        if (currentPage < totalPages - 1) {
          setCurrentPage((prev) => prev + 1);
          window.scrollTo(0, 0);
        } else if (nextChapter) {
          handleChapterChange(nextChapter);
        }
      } else {
        if (currentPage > 0) {
          setCurrentPage((prev) => prev - 1);
          window.scrollTo(0, 0);
        } else if (prevChapter) {
          handleChapterChange(prevChapter);
        }
      }
    },
    [currentPage, data, nextChapter, prevChapter]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readingMode === "single") {
        if (e.key === "ArrowRight") handlePageChange("next");
        if (e.key === "ArrowLeft") handlePageChange("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readingMode, handlePageChange]);

  if (loading && !data) return <Spinner />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-neutral-900 text-neutral-200">
        <div className="text-rose-400 bg-rose-500/10 p-6 border border-rose-500/20">
          {error || "Không thể tải chương"}
        </div>
        <Link
          to="/"
          className="text-neutral-400 hover:text-white uppercase tracking-widest text-xs font-bold border-b border-transparent hover:border-white transition-all"
        >
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  const images = data.item.chapter_image.map((img) => {
    return `${data.domain_cdn}/${data.item.chapter_path}/${img.image_file}`;
  });

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col font-sans">
      {/* Japanese Style Top Bar: Minimal, Sharp, Dark */}
      <div
        className={`${
          readingMode === "single" ? "fixed w-full" : "sticky"
        } top-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 transition-transform duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/comic/${slug}`)}
              className="group flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
              title="Quay Lại"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                {comic?.name || "Quay lại"}
              </span>
            </button>
          </div>

          {/* Center: Chapter Selector */}
          <div className="relative">
            <button
              onClick={() => setIsChapterListOpen(!isChapterListOpen)}
              className="flex items-center gap-2 px-4 py-1.5 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/50 hover:border-neutral-600 transition-all"
            >
              <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-[250px]">
                {data.item.chapter_path.split("/").pop()?.replace(/_/g, " ") ||
                  "Chương"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-3 h-3 transition-transform duration-300 ${
                  isChapterListOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {/* Dropdown - Sharp corners, minimalist */}
            {isChapterListOpen && comic && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 max-h-[60vh] overflow-y-auto bg-neutral-900 border border-neutral-800 shadow-2xl z-50 custom-scrollbar">
                {comic.chapters[0]?.server_data.map((chapter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChapterChange(chapter)}
                    className={`w-full text-left px-5 py-3 border-b border-neutral-800 hover:bg-neutral-800 transition-colors flex justify-between items-center text-sm group ${
                      chapter.chapter_api_data ===
                      decodeURIComponent(apiUrl || "")
                        ? "bg-neutral-800 text-rose-500"
                        : "text-neutral-400"
                    }`}
                  >
                    <span className="font-medium group-hover:text-white transition-colors">
                      Chương {chapter.chapter_name}
                    </span>
                    {chapter.chapter_api_data ===
                      decodeURIComponent(apiUrl || "") && (
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Settings */}
          <div className="flex items-center gap-1 bg-neutral-800/50 p-0.5 border border-neutral-700/30">
            <button
              onClick={() => setReadingMode("scroll")}
              className={`p-2 transition-all ${
                readingMode === "scroll"
                  ? "bg-neutral-700 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
              title="Cuộn Dọc"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"
                />
              </svg>
            </button>
            <button
              onClick={() => setReadingMode("single")}
              className={`p-2 transition-all ${
                readingMode === "single"
                  ? "bg-neutral-700 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
              title="Từng Trang"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Reader Area */}
      <div
        className={`flex-grow w-full mx-auto bg-neutral-950 min-h-screen ${
          readingMode === "scroll" ? "max-w-3xl shadow-2xl shadow-black" : ""
        }`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-[80vh] w-full">
            <div className="relative w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-neutral-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-rose-600 border-r-rose-600 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : readingMode === "scroll" ? (
          <div className="flex flex-col items-center">
            {images.map((src, index) => (
              <div key={index} className="w-full relative">
                {/* Minimal placeholder/loading effect could go here */}
                <img
                  src={src}
                  alt={`Page ${index + 1}`}
                  loading="lazy"
                  className="w-full h-auto block"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-[100dvh] w-full relative overflow-hidden select-none"
            onClick={(e) => {
              const width = e.currentTarget.clientWidth;
              const clickX = e.nativeEvent.offsetX;
              const zoneWidth = width * 0.3;
              if (clickX < zoneWidth) handlePageChange("prev");
              else if (clickX > width - zoneWidth) handlePageChange("next");
              else setShowNav(!showNav);
            }}
          >
            <img
              src={images[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />

            {/* Modern Minimal Page Indicator */}
            <div
              className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/80 text-neutral-300 px-4 py-1 text-xs font-mono tracking-widest backdrop-blur-sm border border-neutral-800 transition-all duration-300 ${
                showNav
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              {currentPage + 1} / {images.length}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer - Floating style for Scroll Mode */}
      {(readingMode === "scroll" || showNav) && (
        <div
          className={`bg-neutral-900/95 border-t border-neutral-800 py-4 backdrop-blur-sm ${
            readingMode === "single" ? "fixed bottom-0 left-0 right-0 z-50" : ""
          }`}
        >
          <div className="container mx-auto px-4 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-6 w-full max-w-lg">
              <button
                onClick={() => prevChapter && handleChapterChange(prevChapter)}
                disabled={!prevChapter}
                className={`flex-1 px-4 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-all border ${
                  prevChapter
                    ? "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
                    : "bg-transparent text-neutral-600 border-neutral-800 cursor-not-allowed"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
                <span>Chapter trước</span>
              </button>

              <button
                onClick={() => nextChapter && handleChapterChange(nextChapter)}
                disabled={!nextChapter}
                className={`flex-1 px-4 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-all border ${
                  nextChapter
                    ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                    : "bg-transparent text-neutral-600 border-neutral-800 cursor-not-allowed"
                }`}
              >
                <span>Chapter sau</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>

            {comic && (
              <Link
                to={`/comic/${comic.slug}`}
                className="text-neutral-500 hover:text-rose-500 text-xs tracking-widest uppercase transition-colors"
              >
                {comic.name}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterViewer;
