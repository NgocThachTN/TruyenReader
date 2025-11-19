import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchComics } from '../services/api';
import { SearchData } from '../types';
import ComicCard from '../components/ComicCard';
import Spinner from '../components/Spinner';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!keyword) return;
      
      setLoading(true);
      setError(null);
      try {
        const result = await searchComics(keyword);
        setData(result.data);
      } catch (err) {
        setError('Tìm kiếm thất bại. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [keyword]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Kết Quả Tìm Kiếm</h1>
        <p className="text-slate-400">Kết quả cho "{keyword}"</p>
      </div>

      {data && data.items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {data.items.map((item) => (
            <ComicCard 
              key={item._id} 
              comic={item} 
              domain={data.APP_DOMAIN_CDN_IMAGE} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-10">
          {keyword ? 'Không tìm thấy truyện nào phù hợp.' : 'Nhập từ khóa để tìm kiếm.'}
        </div>
      )}
    </div>
  );
};

export default Search;
