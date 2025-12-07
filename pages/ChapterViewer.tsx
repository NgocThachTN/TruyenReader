import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchChapterData, fetchComicDetail } from "../services/api";
import { ChapterData, ComicDetailItem, ChapterInfo } from "../types/types";
import Spinner from "../components/Spinner";
import { addToHistory, getHistory } from "../services/history";

const STORAGE_KEY = "otruyen_reader_settings";

interface ReaderSettings {
  readingMode: "scroll" | "single";
  zoom: number;
  brightness: number;
  scrollWidth: "md" | "lg" | "full";
  isEyeProtection: boolean;
  eyeProtectionLevel: number;
}

// --- Sub-Components (Memoized for Performance) ---

const ScrollImage = React.memo(
  ({ src, index }: { src: string; index: number }) => (
    <div className="w-full relative min-h-[200px] bg-neutral-900/50">
      <img
        src={src}
        alt={`Page ${index + 1}`}
        loading="lazy"
        decoding="async"
        className="w-full h-auto block"
      />
    </div>
  )
);

const ScrollModeViewer = React.memo(({ images }: { images: string[] }) => {
  return (
    <div className="flex flex-col items-center">
      {images.map((src, index) => (
        <ScrollImage key={index} src={src} index={index} />
      ))}
    </div>
  );
});

const SingleModeViewer = React.memo(
  ({
    images,
    pageIndex,
    totalImages,
    zoom,
    showNav,
    onPrev,
    onNext,
    onToggleNav,
  }: {
    images: string[];
    pageIndex: number;
    totalImages: number;
    zoom: number;
    showNav: boolean;
    onPrev: () => void;
    onNext: () => void;
    onToggleNav: () => void;
  }) => {
    // Detect screen aspect ratio and device type for mobile optimization
    const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
    const [isTallScreen, setIsTallScreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const updateScreenInfo = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const ratio = width / height;

        setAspectRatio(ratio);
        // Tall screens: ratio < 0.55 (roughly 18:9 and above)
        // Standard screens: ratio >= 0.55 (16:9 and similar)
        setIsTallScreen(ratio < 0.55);
        // Mobile: width < 768px (Tailwind's md breakpoint)
        setIsMobile(width < 768);
      };

      updateScreenInfo();
      window.addEventListener("resize", updateScreenInfo);
      return () => window.removeEventListener("resize", updateScreenInfo);
    }, []);

    // Render current, prev, and next images to ensure they are pre-loaded/decoded
    // Using unique keys ensures the DOM elements persist during transitions, eliminating flicker
    const relevantIndices = [pageIndex - 1, pageIndex, pageIndex + 1].filter(
      (i) => i >= 0 && i < totalImages
    );

    // Mobile optimization: adjust padding, max-height, and click zones based on screen type
    // Use minimal top padding to push image up on mobile, especially for 18:9 screens
    const containerPadding = isMobile
      ? isTallScreen
        ? "pt-0 pb-1" // Tall mobile (18:9): no top padding to maximize space
        : "pt-2 pb-2 sm:pt-4 sm:pb-4" // Standard mobile: minimal top padding
      : "py-4"; // Desktop: standard padding

    const maxHeightClass = isMobile
      ? isTallScreen
        ? "max-h-[calc(100vh-0.5rem)]" // Tall mobile: maximize space
        : "max-h-[calc(100vh-2rem)]" // Standard mobile: standard spacing
      : "max-h-screen"; // Desktop: full screen

    // Optimize click zones for mobile
    // Tall screens need narrower zones to avoid accidental clicks
    const clickZoneWidth = isMobile
      ? isTallScreen
        ? 0.25 // Tall mobile: narrower zones
        : 0.3 // Standard mobile: standard zones
      : 0.3; // Desktop: standard zones

    // Transform origin: top for tall screens to keep image at top, top for standard
    const transformOrigin = "top center";

    // Page indicator position: adjust for mobile screen types
    const indicatorBottom = isMobile
      ? isTallScreen
        ? "bottom-3" // Tall mobile: closer to bottom
        : "bottom-4 sm:bottom-6" // Standard mobile: standard position
      : "bottom-6"; // Desktop: standard position

    // Add offset to push image up on mobile, optimized for 18:9 screens
    const imageOffset = isMobile
      ? isTallScreen
        ? "-translate-y-24" // Tall mobile (18:9): push up even higher to reduce black space
        : "-translate-y-12 sm:-translate-y-14" // Standard mobile: push up higher
      : ""; // Desktop: no offset

    // Use justify-start for tall screens to start from top, center for others
    const containerJustify =
      isMobile && isTallScreen ? "justify-start" : "justify-center";

    return (
      <div
        className={`flex flex-col items-center ${containerJustify} w-full h-full relative select-none ${containerPadding}`}
        onClick={(e) => {
          const width = e.currentTarget.clientWidth;
          const clickX = e.nativeEvent.offsetX;
          const zoneWidth = width * clickZoneWidth;
          if (clickX < zoneWidth) onPrev();
          else if (clickX > width - zoneWidth) onNext();
          else onToggleNav();
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transition: "transform 0.2s ease-out",
            transformOrigin: transformOrigin,
          }}
          className={`relative flex items-center justify-center w-full h-full ${imageOffset}`}
        >
          {relevantIndices.map((index) => (
            <img
              key={index}
              src={images[index]}
              alt={`Page ${index + 1}`}
              loading="eager"
              className={`max-w-full ${maxHeightClass} object-contain shadow-2xl transition-opacity duration-75 ${
                index === pageIndex
                  ? "relative opacity-100 z-10"
                  : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 -z-10 pointer-events-none"
              }`}
              draggable={false}
            />
          ))}
        </div>

        {/* Page Indicator - Optimized position for different mobile screen types */}
        <div
          className={`fixed ${indicatorBottom} left-1/2 -translate-x-1/2 bg-neutral-900/80 text-neutral-300 px-3 sm:px-4 py-1 text-xs font-mono tracking-widest backdrop-blur-sm border border-neutral-800 transition-all duration-300 rounded-full z-50 ${
            showNav
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {pageIndex + 1} / {totalImages}
        </div>
      </div>
    );
  }
);

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
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [isEyeProtection, setIsEyeProtection] = useState(false);
  const [eyeProtectionLevel, setEyeProtectionLevel] = useState(30);
  const [scrollWidth, setScrollWidth] = useState<"md" | "lg" | "full">("lg");

  // Auto Scroll State
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1); // 1-5
  const autoScrollFrame = useRef<number | null>(null);

  // Navigation State
  const [prevChapter, setPrevChapter] = useState<ChapterInfo | null>(null);
  const [nextChapter, setNextChapter] = useState<ChapterInfo | null>(null);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // UI State
  const [showNav, setShowNav] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showGoTop, setShowGoTop] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTick = useRef(false);

  // Mobile tall screen detection for scroll prevention
  const [isMobileTallScreen, setIsMobileTallScreen] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Load Settings ---
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed: ReaderSettings = JSON.parse(savedSettings);
        setReadingMode(parsed.readingMode || "scroll");
        setZoom(parsed.zoom || 1);
        setBrightness(parsed.brightness || 100);
        setScrollWidth(parsed.scrollWidth || "lg");
        setIsEyeProtection(parsed.isEyeProtection || false);
        setEyeProtectionLevel(parsed.eyeProtectionLevel || 30);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // --- Save Settings ---
  useEffect(() => {
    const settings: ReaderSettings = {
      readingMode,
      zoom,
      brightness,
      scrollWidth,
      isEyeProtection,
      eyeProtectionLevel,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [
    readingMode,
    zoom,
    brightness,
    scrollWidth,
    isEyeProtection,
    eyeProtectionLevel,
  ]);

  // --- Derived Data ---
  const images = useMemo(() => {
    if (!data || !data.item || !data.item.chapter_image) return [];

    try {
      return data.item.chapter_image.map((img: any) => {
        const fileName = typeof img === "string" ? img : img.image_file;
        return `${data.domain_cdn}/${data.item.chapter_path}/${fileName}`;
      });
    } catch (err) {
      console.error("Error parsing chapter images:", err);
      return [];
    }
  }, [data]);

  // --- Effects ---

  // Scroll & Nav Visibility Logic (Throttled with rAF)
  useEffect(() => {
    const controlNavbar = () => {
      if (!scrollTick.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Calculate Progress
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const progress =
            totalHeight > 0 ? (currentScrollY / totalHeight) * 100 : 0;
          setScrollProgress(progress);

          // Go to Top visibility
          setShowGoTop(currentScrollY > 500);

          if (readingMode !== "single") {
            // Don't hide nav if auto-scrolling
            if (isAutoScroll) {
              setShowNav(false);
            } else {
              if (
                currentScrollY > lastScrollY.current &&
                currentScrollY > 100
              ) {
                setShowNav(false);
                setIsChapterListOpen(false);
                setIsSettingsOpen(false);
              } else {
                setShowNav(true);
              }
            }
          }

          lastScrollY.current = currentScrollY;
          scrollTick.current = false;
        });
        scrollTick.current = true;
      }
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [readingMode, isAutoScroll]);

  // Auto Scroll Logic (Using requestAnimationFrame)
  useEffect(() => {
    const scrollStep = () => {
      // Check if we reached bottom
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        setIsAutoScroll(false);
        return;
      }
      window.scrollBy(0, autoScrollSpeed);
      autoScrollFrame.current = requestAnimationFrame(scrollStep);
    };

    if (isAutoScroll && readingMode === "scroll") {
      if (autoScrollFrame.current)
        cancelAnimationFrame(autoScrollFrame.current);
      autoScrollFrame.current = requestAnimationFrame(scrollStep);
    } else {
      if (autoScrollFrame.current) {
        cancelAnimationFrame(autoScrollFrame.current);
        autoScrollFrame.current = null;
      }
    }
    return () => {
      if (autoScrollFrame.current)
        cancelAnimationFrame(autoScrollFrame.current);
    };
  }, [isAutoScroll, autoScrollSpeed, readingMode]);

  // Reset currentPage when chapter changes
  useEffect(() => {
    if (apiUrl) {
      setCurrentPage(0);
      window.scrollTo(0, 0);
    }
  }, [apiUrl]);

  // Detect mobile tall screen for scroll prevention
  useEffect(() => {
    const checkMobileTallScreen = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = width / height;
      // Mobile: width < 768px AND tall screen: ratio < 0.55
      setIsMobileTallScreen(width < 768 && ratio < 0.55);
    };

    checkMobileTallScreen();
    window.addEventListener("resize", checkMobileTallScreen);
    return () => window.removeEventListener("resize", checkMobileTallScreen);
  }, []);

  // Prevent scroll on body when in single mode on mobile tall screen
  useEffect(() => {
    if (readingMode === "single" && isMobileTallScreen) {
      // Prevent scroll
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      // Lock scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scroll
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    } else {
      // Restore scroll when not in single mode or not mobile tall screen
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    }
  }, [readingMode, isMobileTallScreen]);

  // Reset scroll position when page changes in single mode
  useEffect(() => {
    if (readingMode === "single") {
      window.scrollTo(0, 0);
      // Also reset on body if it's fixed
      if (isMobileTallScreen) {
        document.body.style.top = "0px";
      }
    }
  }, [currentPage, readingMode, isMobileTallScreen]);

  // Data Fetching
  useEffect(() => {
    if (!apiUrl) return;

    const loadChapter = async () => {
      setLoading(true);
      setError(null);
      setIsAutoScroll(false);

      try {
        const decodedUrl = decodeURIComponent(apiUrl);

        const chapterResult = await fetchChapterData(decodedUrl);

        if (!chapterResult || !chapterResult.data || !chapterResult.data.item) {
          throw new Error("Invalid chapter data format");
        }

        setData(chapterResult.data);

        // Restore reading progress if available
        const history = await getHistory(); // getHistory is async now
        const savedProgress = history.find(
          (h) => h.chapterApiData === decodedUrl
        );
        if (savedProgress && savedProgress.lastPage) {
          setCurrentPage(savedProgress.lastPage);
        }

        window.scrollTo(0, 0);

        if (slug && (!comic || comic.slug !== slug)) {
          const comicResult = await fetchComicDetail(slug);
          setComic(comicResult.data.item);
          setImageDomain(comicResult.data.APP_DOMAIN_CDN_IMAGE);
        }
      } catch (err: any) {
        console.error("Chapter load error:", err);
        setError(err.message || "Không thể tải ảnh chương.");
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, slug]);

  // History Tracking
  useEffect(() => {
    if (comic && apiUrl && imageDomain) {
      const decodedUrl = decodeURIComponent(apiUrl);
      const allChapters = comic.chapters[0]?.server_data || [];
      const currentChapter = allChapters.find(
        (c) => c.chapter_api_data === decodedUrl
      );

      if (currentChapter) {
        addToHistory(
          comic,
          currentChapter,
          imageDomain,
          readingMode === "single" ? currentPage : 0
        );
      }
    }
  }, [comic, apiUrl, imageDomain, currentPage, readingMode]);

  const sortedChapters = useMemo(() => {
    if (!comic) return [];
    const list = comic.chapters[0]?.server_data || [];
    return [...list].sort(
      (a, b) => parseFloat(b.chapter_name) - parseFloat(a.chapter_name)
    );
  }, [comic]);

  // Prev/Next Chapter Logic
  useEffect(() => {
    if (!sortedChapters.length || !apiUrl) return;

    const decodedUrl = decodeURIComponent(apiUrl);
    const currentIndex = sortedChapters.findIndex(
      (c) => c.chapter_api_data === decodedUrl
    );

    if (currentIndex !== -1) {
      setNextChapter(sortedChapters[currentIndex - 1] || null);
      setPrevChapter(sortedChapters[currentIndex + 1] || null);
    }
  }, [sortedChapters, apiUrl]);

  // Image Preloading
  useEffect(() => {
    if (images.length === 0) return;

    const preloadImage = (url: string) => {
      const img = new Image();
      img.src = url;
    };

    if (readingMode === "single") {
      const nextPages = [1, 2, 3];
      nextPages.forEach((offset) => {
        if (currentPage + offset < images.length) {
          preloadImage(images[currentPage + offset]);
        }
      });
    }
  }, [images, currentPage, readingMode]);

  // Handlers
  const handleChapterChange = (chapter: ChapterInfo) => {
    if (chapter && slug) {
      navigate(
        `/chapter/${slug}/${encodeURIComponent(chapter.chapter_api_data)}`
      );
      window.scrollTo(0, 0);
      setIsChapterListOpen(false);
      setIsSettingsOpen(false);
      setIsAutoScroll(false);
    }
  };

  const handlePageChange = useCallback(
    (direction: "next" | "prev") => {
      if (!data) return;
      const totalPages = images.length;

      // Reset scroll immediately before page change
      window.scrollTo(0, 0);
      if (isMobileTallScreen && readingMode === "single") {
        document.body.style.top = "0px";
      }

      if (direction === "next") {
        if (currentPage < totalPages - 1) {
          setCurrentPage((prev) => prev + 1);
        } else if (nextChapter) {
          handleChapterChange(nextChapter);
        }
      } else {
        if (currentPage > 0) {
          setCurrentPage((prev) => prev - 1);
        } else if (prevChapter) {
          handleChapterChange(prevChapter);
        }
      }
    },
    [
      currentPage,
      data,
      images.length,
      nextChapter,
      prevChapter,
      isMobileTallScreen,
      readingMode,
      handleChapterChange,
    ]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "b") setIsSettingsOpen((prev) => !prev);

      if (readingMode === "single") {
        if (e.key === "ArrowRight" || e.key === " ") handlePageChange("next");
        if (e.key === "ArrowLeft") handlePageChange("prev");
      } else {
        if (e.key === "a") setIsAutoScroll((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readingMode, handlePageChange]);

  // Zoom Helpers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

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

  // Scroll Width Classes
  const getContainerWidth = () => {
    if (readingMode === "single") {
      // Add overflow-hidden for mobile tall screen to prevent scroll
      const overflowClass = isMobileTallScreen ? "overflow-hidden" : "";
      return `w-full h-screen flex items-center justify-center ${overflowClass}`;
    }
    switch (scrollWidth) {
      case "md":
        return "max-w-2xl shadow-2xl shadow-black";
      case "full":
        return "w-full max-w-none";
      case "lg":
      default:
        return "max-w-4xl shadow-2xl shadow-black";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col font-sans relative">
      {/* Progress Bar (Global) */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-neutral-800">
        <div
          className="h-full bg-rose-600 transition-all duration-100 ease-out"
          style={{
            width:
              readingMode === "single"
                ? `${((currentPage + 1) / images.length) * 100}%`
                : `${scrollProgress}%`,
          }}
        ></div>
      </div>

      {/* Brightness & Eye Protection Overlay */}
      <div
        className="fixed inset-0 z-[100] pointer-events-none transition-all duration-300"
        style={{
          backgroundColor: isEyeProtection ? "rgb(255, 200, 150)" : "black",
          opacity: isEyeProtection
            ? eyeProtectionLevel / 100
            : (100 - brightness) / 100,
          mixBlendMode: isEyeProtection ? "multiply" : "multiply",
        }}
      />
      {isEyeProtection && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none bg-black transition-opacity duration-300"
          style={{
            opacity: (100 - brightness) / 100,
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Floating Navigation Buttons */}
      <div className="fixed bottom-8 left-4 z-40 flex flex-col gap-2 hidden lg:flex">
        {prevChapter && (
          <button
            onClick={() => handleChapterChange(prevChapter)}
            className="w-12 h-12 bg-neutral-800/50 hover:bg-neutral-700 text-neutral-400 hover:text-white backdrop-blur-sm border border-neutral-700 rounded-full flex items-center justify-center transition-all shadow-lg group"
            title="Chương trước"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="fixed bottom-8 right-4 z-40 flex flex-col gap-2 hidden lg:flex">
        {nextChapter && (
          <button
            onClick={() => handleChapterChange(nextChapter)}
            className="w-12 h-12 bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-sm border border-rose-500 rounded-full flex items-center justify-center transition-all shadow-lg shadow-rose-500/20 group"
            title="Chương sau"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 group-hover:translate-x-0.5 transition-transform"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Go To Top Button (Position fixed for mobile) */}
      <div
        className={`fixed bottom-4 lg:bottom-24 right-4 z-40 transition-all duration-300 transform ${
          showGoTop
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToTop}
          className="w-10 h-10 bg-neutral-800/80 hover:bg-rose-600 text-white backdrop-blur-sm border border-neutral-700 hover:border-rose-500 rounded-lg flex items-center justify-center shadow-lg transition-all"
          title="Lên đầu trang"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
            />
          </svg>
        </button>
      </div>

      {/* Top Navigation Bar */}
      <div
        className={`${
          readingMode === "single" ? "fixed w-full" : "sticky"
        } top-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 transition-transform duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Back */}
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
          <div className="flex items-center gap-2">
            {/* Prev Chapter Button (Mobile) */}
            <button
              onClick={() => prevChapter && handleChapterChange(prevChapter)}
              disabled={!prevChapter}
              className={`p-1.5 rounded border border-neutral-700/50 transition-all lg:hidden ${
                prevChapter
                  ? "bg-neutral-800/50 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-600"
                  : "bg-neutral-900/30 text-neutral-600 cursor-not-allowed border-transparent"
              }`}
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
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setIsChapterListOpen(!isChapterListOpen);
                  setIsSettingsOpen(false);
                }}
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

              {isChapterListOpen && sortedChapters.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 max-h-[60vh] overflow-y-auto bg-neutral-900 border border-neutral-800 shadow-2xl z-50 custom-scrollbar">
                  {sortedChapters.map((chapter, idx) => (
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

            {/* Next Chapter Button (Mobile) */}
            <button
              onClick={() => nextChapter && handleChapterChange(nextChapter)}
              disabled={!nextChapter}
              className={`p-1.5 rounded border border-neutral-700/50 transition-all lg:hidden ${
                nextChapter
                  ? "bg-neutral-800/50 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-600"
                  : "bg-neutral-900/30 text-neutral-600 cursor-not-allowed border-transparent"
              }`}
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
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* Right: Settings & Toggle */}
          <div className="flex items-center gap-2">
            {/* Reading Mode Toggle */}
            <div className="flex items-center bg-neutral-800/50 p-0.5 border border-neutral-700/30 rounded">
              <button
                onClick={() => setReadingMode("scroll")}
                className={`p-1.5 rounded transition-all ${
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
                className={`p-1.5 rounded transition-all ${
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

            {/* Settings Button */}
            <button
              onClick={() => {
                setIsSettingsOpen(!isSettingsOpen);
                setIsChapterListOpen(false);
              }}
              className={`p-2 rounded-full transition-colors ${
                isSettingsOpen
                  ? "bg-neutral-800 text-rose-500"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
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
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          </div>

          {/* Settings Dropdown */}
          {isSettingsOpen && (
            <div className="absolute top-full right-4 mt-2 w-72 bg-neutral-900 border border-neutral-800 shadow-xl rounded-lg p-4 z-50">
              <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-4">
                Cài đặt đọc truyện
              </h3>

              {/* Eye Protection Toggle */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-neutral-300">Bảo vệ mắt</span>
                <button
                  onClick={() => setIsEyeProtection(!isEyeProtection)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isEyeProtection ? "bg-rose-600" : "bg-neutral-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      isEyeProtection ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {isEyeProtection && (
                <div className="mb-6 pl-2 border-l-2 border-neutral-800">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-neutral-400 text-xs">Mức độ</span>
                    <span className="text-rose-500 text-xs">
                      {eyeProtectionLevel}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={eyeProtectionLevel}
                    onChange={(e) =>
                      setEyeProtectionLevel(Number(e.target.value))
                    }
                    className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>
              )}

              {/* Auto Scroll Toggle */}
              {readingMode === "scroll" && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-300">
                      Tự động cuộn
                    </span>
                    <button
                      onClick={() => setIsAutoScroll(!isAutoScroll)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        isAutoScroll ? "bg-rose-600" : "bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          isAutoScroll ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  {isAutoScroll && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-neutral-500">Chậm</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={autoScrollSpeed}
                        onChange={(e) =>
                          setAutoScrollSpeed(Number(e.target.value))
                        }
                        className="flex-1 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                      />
                      <span className="text-xs text-neutral-500">Nhanh</span>
                    </div>
                  )}
                </div>
              )}

              {/* Brightness Control */}
              <div className="mb-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-neutral-300">Độ sáng</span>
                  <span className="text-rose-500">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>

              {/* Size / Width Control */}
              <div className="mb-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-neutral-300">
                    {readingMode === "scroll" ? "Chiều rộng ảnh" : "Thu phóng"}
                  </span>
                  {readingMode === "single" && (
                    <span className="text-rose-500">
                      {Math.round(zoom * 100)}%
                    </span>
                  )}
                </div>

                {readingMode === "scroll" ? (
                  <div className="flex bg-neutral-800 p-1 rounded-lg">
                    <button
                      onClick={() => setScrollWidth("md")}
                      className={`flex-1 py-1 text-xs rounded font-medium transition-colors ${
                        scrollWidth === "md"
                          ? "bg-neutral-700 text-white"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      Nhỏ
                    </button>
                    <button
                      onClick={() => setScrollWidth("lg")}
                      className={`flex-1 py-1 text-xs rounded font-medium transition-colors ${
                        scrollWidth === "lg"
                          ? "bg-neutral-700 text-white"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      Vừa
                    </button>
                    <button
                      onClick={() => setScrollWidth("full")}
                      className={`flex-1 py-1 text-xs rounded font-medium transition-colors ${
                        scrollWidth === "full"
                          ? "bg-neutral-700 text-white"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      Full
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleZoomOut}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300"
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
                          d="M19.5 12h-15"
                        />
                      </svg>
                    </button>
                    <div className="flex-1 text-center text-sm font-mono text-neutral-400 bg-neutral-800/50 py-2 rounded">
                      {(zoom * 100).toFixed(0)}%
                    </div>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300"
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
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleResetZoom}
                      className="p-2 text-xs text-rose-500 hover:underline ml-2"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reader Area */}
      <div
        ref={containerRef}
        className={`flex-grow mx-auto bg-neutral-950 min-h-screen transition-all duration-300 ${getContainerWidth()}`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-[80vh] w-full">
            <div className="relative w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-neutral-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-rose-600 border-r-rose-600 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : readingMode === "scroll" ? (
          <ScrollModeViewer images={images} />
        ) : (
          <SingleModeViewer
            images={images}
            pageIndex={currentPage}
            totalImages={images.length}
            zoom={zoom}
            showNav={showNav}
            onPrev={() => {
              handlePageChange("prev");
              setIsSettingsOpen(false);
              setIsChapterListOpen(false);
            }}
            onNext={() => {
              handlePageChange("next");
              setIsSettingsOpen(false);
              setIsChapterListOpen(false);
            }}
            onToggleNav={() => {
              if (isSettingsOpen || isChapterListOpen) {
                setIsSettingsOpen(false);
                setIsChapterListOpen(false);
              } else {
                setShowNav(!showNav);
              }
            }}
          />
        )}
      </div>

      {/* Navigation Footer - Floating style for Scroll Mode */}
      {(readingMode === "scroll" || showNav) && (
        <div
          className={`bg-neutral-900/95 border-t border-neutral-800 py-4 backdrop-blur-sm transition-transform duration-300 ${
            readingMode === "single" ? "fixed bottom-0 left-0 right-0 z-50" : ""
          } ${
            readingMode === "single" && !showNav
              ? "translate-y-full"
              : "translate-y-0"
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
