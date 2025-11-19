import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchComicList } from '../services/api';
import { CategoryDetailData } from '../types';
import ComicCard from '../components/ComicCard';
import Spinner from '../components/Spinner';

const ComicList: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  
  const [data, setData] = useState<CategoryDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchComicList(slug, page);
        setData(result.data);
      } catch (err) {
        setError('Failed to load comics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    window.scrollTo(0, 0);
  }, [slug, page]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (loading) return <Spinner />;
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 text-center bg-neutral-950 min-h-screen">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 font-bold uppercase tracking-wider inline-block">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { pagination } = data.params;
  const totalPages = Math.ceil(pagination.totalItems / pagination.totalItemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, start + maxPagesToShow - 1);
      
      if (end - start < maxPagesToShow - 1) {
        start = Math.max(1, end - maxPagesToShow + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight flex items-center gap-3">
             <span className="w-2 h-8 bg-rose-600"></span>
             {data.titlePage}
          </h1>
          <p className="text-neutral-500 text-sm tracking-widest uppercase pl-5">
            Page <span className="text-rose-500 font-bold">{page}</span> of {totalPages}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
          {data.items.map((item) => (
            <ComicCard 
              key={item._id} 
              comic={item} 
              domain={data.APP_DOMAIN_CDN_IMAGE} 
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-neutral-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors border border-neutral-800 font-bold text-xs uppercase tracking-wider"
            >
              Prev
            </button>
            
            {getPageNumbers().map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-10 h-10 flex items-center justify-center transition-colors font-bold text-xs ${
                  p === page 
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]' 
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {p}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-neutral-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors border border-neutral-800 font-bold text-xs uppercase tracking-wider"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComicList;
