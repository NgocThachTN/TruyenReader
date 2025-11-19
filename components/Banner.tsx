import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ComicItem } from '../types';
import { getImageUrl } from '../services/api';

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
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl mb-8 group">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center container mx-auto px-4 md:px-10">
        <div className="flex gap-6 md:gap-10 items-end w-full">
            {/* Thumbnail (Hidden on mobile, visible on larger screens) */}
            <div className="hidden md:block w-48 h-72 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700/50 transform transition-transform hover:scale-105">
                <img src={imageUrl} alt={currentComic.name} className="w-full h-full object-cover" />
            </div>

            {/* Text Info */}
            <div className="flex-1 max-w-2xl mb-8 md:mb-0">
                <div className="flex flex-wrap gap-2 mb-3">
                    {currentComic.category.slice(0, 3).map(cat => (
                        <span key={cat.id} className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">
                            {cat.name}
                        </span>
                    ))}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg line-clamp-2">
                    {currentComic.name}
                </h2>
                <div className="flex items-center gap-4 mb-6 text-slate-300 text-sm md:text-base">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(currentComic.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        {currentComic.chaptersLatest?.[0]?.chapter_name ? `Chapter ${currentComic.chaptersLatest[0].chapter_name}` : 'Updating'}
                    </span>
                </div>
                <Link 
                    to={`/comic/${currentComic.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-1"
                >
                    Read Now
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
            </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors border border-white/10 opacity-0 group-hover:opacity-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors border border-white/10 opacity-0 group-hover:opacity-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {comics.map((_, idx) => (
            <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-emerald-500 w-6' : 'bg-white/50 hover:bg-white'}`}
            />
        ))}
      </div>
    </div>
  );
};

export default Banner;
