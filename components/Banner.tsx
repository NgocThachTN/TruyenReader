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
    <div className="relative w-full h-[480px] md:h-[500px] lg:h-[600px] overflow-hidden mb-8 md:mb-12 group border border-neutral-800 bg-neutral-900">
      {/* Background Image with Blur */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        <img
          src={imageUrl}
          alt="Background"
          className="w-full h-full object-cover blur-xl opacity-60 scale-110"
          key={`bg-${imageUrl}`}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-center">
        {/* Reduced pt-14 to pt-8 and pb-6 to pb-4 to shift content up */}
        <div className="container mx-auto px-4 md:px-10 flex flex-col-reverse md:flex-row items-center md:items-end justify-center md:justify-between h-full pb-4 md:pb-12 pt-8 md:pt-20 gap-3 md:gap-8">
          {/* Text Info */}
          <div className="flex-1 w-full max-w-2xl flex flex-col justify-start md:justify-end h-auto md:h-full text-center md:text-left items-center md:items-start z-20 mt-1 md:mt-0">
            <div
              className="mb-2 md:mb-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-xs font-bold uppercase tracking-widest bg-rose-600 text-white inline-block">
                Tiêu Biểu
              </span>
            </div>

            <h2
              className="text-2xl md:text-6xl lg:text-7xl font-black text-white mb-2 md:mb-4 leading-tight md:leading-none uppercase tracking-tighter opacity-0 animate-fade-in-up line-clamp-2"
              style={{ animationDelay: "0.2s" }}
            >
              {currentComic.name}
            </h2>

            <div
              className="flex flex-wrap justify-center md:justify-start gap-2 mb-3 md:mb-6 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              {currentComic.category.slice(0, 3).map((cat, idx) => (
                <span
                  key={`${cat.id}-${idx}`}
                  className="px-1.5 py-0.5 md:px-2 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-wider border border-neutral-500 text-neutral-300"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            <div
              className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6 mb-4 md:mb-8 text-neutral-400 text-[10px] md:text-xs font-mono opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <span className="flex items-center gap-1.5 md:gap-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-600 rounded-full"></span>
                CẬP NHẬT:{" "}
                {new Date(currentComic.updatedAt).toLocaleDateString("vi-VN")}
              </span>
              <span className="flex items-center gap-1.5 md:gap-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-neutral-500 rounded-full"></span>
                CHAP MỚI NHẤT:{" "}
                {currentComic.chaptersLatest?.[0]?.chapter_name
                  ? `CHAP ${currentComic.chaptersLatest[0].chapter_name}`
                  : "N/A"}
              </span>
            </div>

            <div
              className="flex gap-3 md:gap-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <Link
                to={`/comic/${currentComic.slug}`}
                className="px-6 py-2.5 md:px-8 md:py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm uppercase tracking-wider transition-all hover:-translate-y-1 border border-rose-600"
              >
                Đọc Ngay
              </Link>
              <Link
                to={`/comic/${currentComic.slug}`}
                className="px-6 py-2.5 md:px-8 md:py-3 bg-transparent hover:bg-white hover:text-black text-white font-bold text-xs md:text-sm uppercase tracking-wider transition-all hover:-translate-y-1 border border-white"
              >
                Chi Tiết
              </Link>
            </div>
          </div>

          {/* Hero Image - Sharp floating card */}
          <div
            className="w-[130px] md:w-[280px] lg:w-[340px] flex-shrink-0 relative z-10 opacity-0 animate-fade-in-right mb-2 md:mb-0"
            style={{ animationDelay: "0.2s" }}
            key={`${currentComic._id}-hero`}
          >
            <div className="relative w-full aspect-[2/3] bg-neutral-800 shadow-[8px_8px_0px_0px_rgba(225,29,72,0.2)] md:shadow-[20px_20px_0px_0px_rgba(225,29,72,0.2)] border border-neutral-700">
              <img
                src={imageUrl}
                alt={currentComic.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-0 bottom-0 w-8 md:w-24 flex items-center justify-center hover:bg-gradient-to-r hover:from-black/50 to-transparent text-white/30 hover:text-white transition-all z-30"
      >
        <svg
          className="w-5 h-5 md:w-10 md:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={1}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-0 bottom-0 w-8 md:w-24 flex items-center justify-center hover:bg-gradient-to-l hover:from-black/50 to-transparent text-white/30 hover:text-white transition-all z-30"
      >
        <svg
          className="w-5 h-5 md:w-10 md:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={1}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Minimal Line Indicators */}
      <div className="absolute bottom-0 left-0 w-full flex">
        {comics.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`flex-1 h-1 transition-all ${
              idx === currentIndex
                ? "bg-rose-600"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
