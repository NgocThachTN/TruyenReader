import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ComicItem } from "../types";
import { getImageUrl } from "../services/api";

interface BannerProps {
  comics: ComicItem[];
  domain: string;
}

const Banner: React.FC<BannerProps> = ({ comics, domain }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % comics.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [comics.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % comics.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + comics.length) % comics.length);
  };

  if (comics.length === 0) return null;

  const currentComic = comics[currentIndex];
  const imageUrl = getImageUrl(domain, currentComic.thumb_url);

  return (
    <div className="relative w-full h-[550px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl mb-10 group shadow-2xl shadow-black/50">
      {/* Background Image with Blur */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt="Background"
          className="w-full h-full object-cover blur-md opacity-40 animate-ken-burns"
          key={imageUrl} // Force re-render for animation
        />
        {/* Complex Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-10 flex flex-col-reverse md:flex-row items-center md:items-end justify-between h-full pb-12 md:pb-16 pt-20 gap-4 md:gap-8">
          {/* Text Info */}
          <div
            className="flex-1 w-full max-w-2xl z-10 flex flex-col justify-end h-full text-center md:text-left items-center md:items-start"
            key={currentComic._id}
          >
            <div
              className="flex flex-wrap justify-center md:justify-start gap-2 mb-3 md:mb-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              {currentComic.category.slice(0, 3).map((cat, idx) => (
                <span
                  key={`${cat.id}-${idx}`}
                  className="px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white rounded shadow-lg shadow-emerald-500/20"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 leading-tight drop-shadow-2xl line-clamp-2 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              {currentComic.name}
            </h2>

            <div
              className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6 mb-6 md:mb-8 text-slate-200 text-xs md:text-base font-medium opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <span className="flex items-center gap-1.5 md:gap-2 bg-black/30 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {new Date(currentComic.updatedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5 md:gap-2 bg-black/30 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                {currentComic.chaptersLatest?.[0]?.chapter_name
                  ? `Chương ${currentComic.chaptersLatest[0].chapter_name}`
                  : "Đang cập nhật"}
              </span>
            </div>

            <div
              className="w-full md:w-auto flex gap-3 md:gap-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Link
                to={`/comic/${currentComic.slug}`}
                className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-base md:text-lg transition-all hover:shadow-xl hover:shadow-emerald-500/20 transform hover:-translate-y-1"
              >
                Đọc Ngay
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
              <Link
                to={`/comic/${currentComic.slug}`}
                className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-base md:text-lg transition-all backdrop-blur-sm border border-white/10"
              >
                Chi Tiết
              </Link>
            </div>
          </div>

          {/* Hero Image (Desktop + Mobile) */}
          <div
            className="w-[180px] md:w-[260px] lg:w-[320px] flex-shrink-0 relative z-10 perspective-1000 opacity-0 animate-fade-in-right mb-2 md:mb-0"
            style={{ animationDelay: "0.2s" }}
            key={`${currentComic._id}-hero`}
          >
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 md:border-4 border-white/10 transform rotate-y-12 hover:rotate-y-0 transition-transform duration-500 group-hover:scale-105 bg-slate-800">
              <img
                src={imageUrl}
                alt={currentComic.name}
                className="w-full h-full object-cover"
              />
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors border border-white/10 opacity-0 group-hover:opacity-100"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors border border-white/10 opacity-0 group-hover:opacity-100"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {comics.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex
                ? "bg-emerald-500 w-6"
                : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
