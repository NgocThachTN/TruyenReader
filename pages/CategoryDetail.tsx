import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchComicsByCategory, fetchComicList } from '../services/api';
import { CategoryDetailData } from '../types';
import ComicCard from '../components/ComicCard';
import Spinner from '../components/Spinner';

const CategoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [data, setData] = useState<CategoryDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('default');

  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      try {
        let result;
        if (filterStatus === 'completed') {
          result = await fetchComicList('hoan-thanh', currentPage, slug);
        } else if (filterStatus === 'ongoing') {
          result = await fetchComicList('dang-phat-hanh', currentPage, slug);
        } else {
          result = await fetchComicsByCategory(slug, currentPage);
        }
        setData(result.data);
      } catch (err) {
        setError('Failed to load comics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, currentPage, filterStatus]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const { totalItems, totalItemsPerPage } = data.params.pagination;
  const totalPages = Math.ceil(totalItems / totalItemsPerPage);

  // Filter and Sort Logic
  let displayedItems = [...data.items];

  if (sortOrder === 'latest') {
    displayedItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } else if (sortOrder === 'oldest') {
    displayedItems.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  } else if (sortOrder === 'name_asc') {
    displayedItems.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'name_desc') {
    displayedItems.sort((a, b) => b.name.localeCompare(a.name));
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{data.titlePage}</h1>
          <p className="text-slate-400">Found {totalItems} comics</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setSearchParams({ page: '1' });
            }}
            className="bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="default">Default Sort</option>
            <option value="latest">Latest Updated</option>
            <option value="oldest">Oldest Updated</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
        {displayedItems.map((item) => (
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
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {currentPage > 2 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    currentPage === 1 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  1
                </button>
                {currentPage > 3 && <span className="text-slate-500">...</span>}
              </>
            )}

            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {currentPage - 1}
              </button>
            )}

            <button
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500 text-white font-medium"
            >
              {currentPage}
            </button>

            {currentPage < totalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {currentPage + 1}
              </button>
            )}

            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && <span className="text-slate-500">...</span>}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    currentPage === totalPages ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
