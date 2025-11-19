import React from 'react';
import { Link } from 'react-router-dom';
import { ComicItem } from '../types';
import { getImageUrl } from '../services/api';

interface ComicCardProps {
  comic: ComicItem;
  domain: string;
}

const ComicCard: React.FC<ComicCardProps> = ({ comic, domain }) => {
  const imageUrl = getImageUrl(domain, comic.thumb_url);
  const latestChapter = comic.chaptersLatest && comic.chaptersLatest.length > 0 
    ? comic.chaptersLatest[0] 
    : null;

  return (
    <Link to={`/comic/${comic.slug}`} className="group flex flex-col h-full bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={comic.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
        {latestChapter && (
            <div className="absolute bottom-2 left-2 right-2">
                <span className="inline-block bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                    Chapter {latestChapter.chapter_name}
                </span>
            </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-white line-clamp-2 mb-2 group-hover:text-emerald-400 transition-colors">
          {comic.name}
        </h3>
        
        <div className="mt-auto flex flex-wrap gap-1">
            {comic.category.slice(0, 2).map((cat) => (
                <span key={cat.id} className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">
                    {cat.name}
                </span>
            ))}
            {comic.category.length > 2 && (
                <span className="text-[10px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">
                    +{comic.category.length - 2}
                </span>
            )}
        </div>
        <div className="text-xs text-slate-500 mt-2">
            Updated: {new Date(comic.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
};

export default ComicCard;