import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchChapterData, fetchComicDetail } from "../services/api";
import { ChapterData, ComicDetailItem, ChapterInfo } from "../types";
import Spinner from "../components/Spinner";

const ChapterViewer: React.FC = () => {
  // We passed the full API URL encoded in the route
  const { slug, apiUrl } = useParams<{ slug: string; apiUrl: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ChapterData | null>(null);
  const [comic, setComic] = useState<ComicDetailItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      if (readingMode === "single") return; // Disable scroll control in single mode

      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowNav(false);
        setIsChapterListOpen(false); // Close dropdown when scrolling down
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
      setLoading(true);
      setError(null);
      try {
        const decodedUrl = decodeURIComponent(apiUrl);

        // 1. Fetch Chapter Data
        const chapterResult = await fetchChapterData(decodedUrl);
        setData(chapterResult.data);
        setCurrentPage(0); // Reset page on chapter change

        // 2. Fetch Comic Details using the slug from params
        if (slug && (!comic || comic.slug !== slug)) {
          const comicResult = await fetchComicDetail(slug);
          setComic(comicResult.data.item);
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

  // Calculate Prev/Next Chapters when comic or current apiUrl changes
  useEffect(() => {
    if (!comic || !apiUrl) return;

    const decodedUrl = decodeURIComponent(apiUrl);

    // Flatten chapters from all servers (usually just one, but handle multiple)
    // We assume the first server is the main one for navigation order
    const allChapters = comic.chapters[0]?.server_data || [];

    const currentIndex = allChapters.findIndex(
      (c) => c.chapter_api_data === decodedUrl
    );

    if (currentIndex !== -1) {
      // Based on user feedback, the list is in ascending order [Chap 1, Chap 2, ...]
      // Current: Chap 2 (index 1)
      // Next: Chap 3 (index 2) -> index + 1
      // Prev: Chap 1 (index 0) -> index - 1

      setNextChapter(allChapters[currentIndex + 1] || null);
      setPrevChapter(allChapters[currentIndex - 1] || null);
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

  // Keyboard navigation for Single Page Mode
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

  if (loading) return <Spinner />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-red-400 bg-red-500/10 p-4 rounded-lg">
          {error || "Không thể tải chương"}
        </div>
        <Link to="/" className="text-emerald-400 hover:underline">
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  // Construct image URLs
  const images = data.item.chapter_image.map((img) => {
    return `${data.domain_cdn}/${data.item.chapter_path}/${img.image_file}`;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Control Bar */}
      <div
        className={`${
          readingMode === "single" ? "fixed w-full" : "sticky"
        } top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 py-1.5 px-3 flex gap-3 justify-between items-center transition-transform duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(`/comic/${slug}`)}
            className="text-slate-300 hover:text-white flex items-center gap-1.5 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            title="Quay Lại Truyện"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <span className="hidden md:inline text-sm font-medium">
              Quay Lại
            </span>
          </button>
        </div>

        {/* Chapter Navigation */}
        <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50 relative shadow-sm">
          <button
            onClick={() => prevChapter && handleChapterChange(prevChapter)}
            disabled={!prevChapter}
            className={`p-1.5 rounded-md transition-colors ${
              prevChapter
                ? "text-slate-300 hover:text-white hover:bg-slate-700"
                : "text-slate-600 cursor-not-allowed"
            }`}
            title="Chương Trước"
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
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <button
            onClick={() => setIsChapterListOpen(!isChapterListOpen)}
            className="flex items-center gap-1 text-slate-200 font-medium text-sm px-2 py-1 hover:text-emerald-400 transition-colors max-w-[140px] sm:max-w-[200px]"
          >
            <span className="truncate">
              {data.item.chapter_path.split("/").pop()?.replace(/_/g, " ") ||
                "Chương"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-3 h-3 transition-transform ${
                isChapterListOpen ? "rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          {/* Chapter Dropdown */}
          {isChapterListOpen && comic && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 max-h-80 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 custom-scrollbar">
              {comic.chapters[0]?.server_data.map((chapter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChapterChange(chapter)}
                  className={`w-full text-left px-4 py-2.5 border-b border-slate-800 hover:bg-slate-800 transition-colors flex justify-between items-center text-sm ${
                    chapter.chapter_api_data ===
                    decodeURIComponent(apiUrl || "")
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-300"
                  }`}
                >
                  <span className="font-medium truncate">
                    Chương {chapter.chapter_name}
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => nextChapter && handleChapterChange(nextChapter)}
            disabled={!nextChapter}
            className={`p-1.5 rounded-md transition-colors ${
              nextChapter
                ? "text-slate-300 hover:text-white hover:bg-slate-700"
                : "text-slate-600 cursor-not-allowed"
            }`}
            title="Chương Sau"
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
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setReadingMode("scroll")}
            className={`p-1.5 rounded text-sm font-medium transition-colors ${
              readingMode === "scroll"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
            title="Cuộn"
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
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"
              />
            </svg>
          </button>
          <button
            onClick={() => setReadingMode("single")}
            className={`p-1.5 rounded text-sm font-medium transition-colors ${
              readingMode === "single"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
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
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Reader Area */}
      <div
        className={`flex-grow w-full mx-auto bg-black min-h-screen ${
          readingMode === "scroll" ? "max-w-4xl" : ""
        }`}
      >
        {readingMode === "scroll" ? (
          // Scroll Mode
          <div className="flex flex-col">
            {images.map((src, index) => (
              <div key={index} className="relative w-full">
                <img
                  src={src}
                  alt={`Trang ${index + 1}`}
                  loading="lazy"
                  className="w-full h-auto block"
                />
              </div>
            ))}
          </div>
        ) : (
          // Single Page Mode - Full Screen Optimization
          <div
            className="flex flex-col items-center justify-center h-[100dvh] w-full relative overflow-hidden touch-manipulation"
            onClick={(e) => {
              const width = e.currentTarget.clientWidth;
              const clickX = e.nativeEvent.offsetX;

              // Divide screen into zones: 30% Left | 40% Center | 30% Right
              const zoneWidth = width * 0.3;

              if (clickX < zoneWidth) {
                handlePageChange("prev");
              } else if (clickX > width - zoneWidth) {
                handlePageChange("next");
              } else {
                setShowNav(!showNav);
              }
            }}
          >
            <img
              src={images[currentPage]}
              alt={`Trang ${currentPage + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />

            {/* Page Counter Overlay - Only show when nav is visible */}
            <div
              className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-1.5 rounded-full text-sm backdrop-blur-md border border-white/10 transition-opacity duration-300 ${
                showNav ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              Trang {currentPage + 1} / {images.length}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {(readingMode === "scroll" || showNav) && (
        <div
          className={`bg-slate-900 border-t border-slate-800 py-2 ${
            readingMode === "single" ? "fixed bottom-0 left-0 right-0 z-40" : ""
          }`}
        >
          <div className="container mx-auto px-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-4 w-full justify-center max-w-md">
              <button
                onClick={() => prevChapter && handleChapterChange(prevChapter)}
                disabled={!prevChapter}
                className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  prevChapter
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-slate-800/50 text-slate-500 cursor-not-allowed"
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
                Chương Trước
              </button>

              <button
                onClick={() => nextChapter && handleChapterChange(nextChapter)}
                disabled={!nextChapter}
                className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  nextChapter
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                }`}
              >
                Chương Sau
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>

            {comic && (
              <Link
                to={`/comic/${comic.slug}`}
                className="text-slate-500 hover:text-emerald-400 text-xs mt-0"
              >
                Quay lại {comic.name}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterViewer;
