import React from "react";
import { Link } from "react-router-dom";
import { ComicItem } from "../types/types";
import { getImageUrl } from "../services/api";

interface ComicCardProps {
  comic: ComicItem;
  domain: string;
}

const ComicCard: React.FC<ComicCardProps> = ({ comic, domain }) => {
  const imageUrl = getImageUrl(domain, comic.thumb_url);
  const latestChapter =
    comic.chaptersLatest && comic.chaptersLatest.length > 0
      ? comic.chaptersLatest[0]
      : null;

  return (
    <Link
      to={`/comic/${comic.slug}`}
      state={{ prefillComic: comic, prefillDomain: domain }}
      className="group flex flex-col h-full bg-neutral-900 border border-neutral-800 hover:border-rose-600 transition-all duration-300 relative"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-800">
        <img
          src={imageUrl}
          alt={comic.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Dark overlay on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

        {/* Chapter Tag */}
        {latestChapter && (
          <div className="absolute top-2 right-2">
            <span className="inline-block bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Chap {latestChapter.chapter_name}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-neutral-200 line-clamp-2 mb-2 group-hover:text-rose-500 transition-colors uppercase tracking-tight">
          {comic.name}
        </h3>

        <div className="mt-auto">
          <div className="flex flex-wrap gap-1 mb-2">
            {comic.category.slice(0, 4).map((cat) => (
              <span
                key={cat.id}
                className="text-[9px] uppercase tracking-wider text-neutral-400 border border-neutral-700 px-1 py-0.5"
              >
                {cat.name}
              </span>
            ))}
          </div>
          <div className="text-[10px] text-neutral-600 font-mono text-right border-t border-neutral-800 pt-2">
            {new Date(comic.updatedAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </div>

      {/* Hover Corner Accent */}
      <div className="absolute top-0 left-0 w-0 h-0 border-t-2 border-l-2 border-rose-600 transition-all duration-300 group-hover:w-4 group-hover:h-4 opacity-0 group-hover:opacity-100"></div>
      <div className="absolute bottom-0 right-0 w-0 h-0 border-b-2 border-r-2 border-rose-600 transition-all duration-300 group-hover:w-4 group-hover:h-4 opacity-0 group-hover:opacity-100"></div>
    </Link>
  );
};

export default ComicCard;
