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
      <div className="container mx-auto px-4 py-10 text-center bg-neutral-950 min-h-screen">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 font-bold uppercase tracking-wider inline-block">
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
    <div className="min-h-screen bg-neutral-950 font-sans pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight flex items-center gap-3">
               <span className="w-2 h-8 bg-rose-600"></span>
               {data.titlePage}
            </h1>
            <p className="text-neutral-500 text-sm tracking-widest uppercase pl-5">Tìm thấy {totalItems} truyện</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setSearchParams({ page: '1' });
              }}
              className="bg-neutral-900 text-white border border-neutral-800 px-4 py-2 focus:outline-none focus:border-rose-600 text-sm font-medium uppercase tracking-wide transition-colors"
            >
              <option value="all">Tất Cả</option>
              <option value="ongoing">Đang Tiến Hành</option>
              <option value="completed">Đã hoàn Thành</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-neutral-900 text-white border border-neutral-800 px-4 py-2 focus:outline-none focus:border-rose-600 text-sm font-medium uppercase tracking-wide transition-colors"
            >
              <option value="default">Mặc Định</option>
              <option value="latest">Mới Nhất</option>
              <option value="oldest">Cũ Nhất</option>
              <option value="name_asc">Tên (A-Z)</option>
              <option value="name_desc">Tên (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
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
              className="px-4 py-2 bg-neutral-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors border border-neutral-800 font-bold text-xs uppercase tracking-wider"
            >
              Prev
            </button>
            
            <div className="flex items-center gap-2">
              {currentPage > 2 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`w-10 h-10 flex items-center justify-center transition-colors font-bold text-xs ${
                      currentPage === 1 ? 'bg-rose-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'
                    }`}
                  >
                    1
                  </button>
                  {currentPage > 3 && <span className="text-neutral-600">...</span>}
                </>
              )}

              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="w-10 h-10 flex items-center justify-center bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800 transition-colors font-bold text-xs"
                >
                  {currentPage - 1}
                </button>
              )}

              <button
                className="w-10 h-10 flex items-center justify-center bg-rose-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(225,29,72,0.4)]"
              >
                {currentPage}
              </button>

              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800 transition-colors font-bold text-xs"
                >
                  {currentPage + 1}
                </button>
              )}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && <span className="text-neutral-600">...</span>}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`w-10 h-10 flex items-center justify-center transition-colors font-bold text-xs ${
                      currentPage === totalPages ? 'bg-rose-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'
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

export default CategoryDetail;
