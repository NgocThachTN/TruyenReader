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
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg inline-block">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { pagination } = data.params;
  const totalPages = Math.ceil(pagination.totalItems / pagination.totalItemsPerPage);

  // Generate page numbers to display
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{data.titlePage}</h1>
        <p className="text-slate-400">Page {page} of {totalPages}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
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
            className={`px-3 py-1 rounded-md ${page === 1 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-emerald-600'}`}
          >
            Prev
          </button>
          
          {getPageNumbers().map(p => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1 rounded-md ${p === page ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            >
              {p}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-md ${page === totalPages ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-emerald-600'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ComicList;
