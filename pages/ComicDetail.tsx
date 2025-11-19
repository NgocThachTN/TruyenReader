import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchComicDetail, getImageUrl } from '../services/api';
import { ComicDetailItem } from '../types';
import Spinner from '../components/Spinner';

const ComicDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [comic, setComic] = useState<ComicDetailItem | null>(null);
  const [domain, setDomain] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const loadDetail = async () => {
      setLoading(true);
      try {
        const result = await fetchComicDetail(slug);
        setComic(result.data.item);
        setDomain(result.data.APP_DOMAIN_CDN_IMAGE);
      } catch (err) {
        setError('Không thể tải thông tin truyện.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleReadChapter = (chapterApiData: string) => {
    // We need to pass the API URL to the reader. 
    // Since we can't put a full URL in the path easily without encoding issues, 
    // let's encode it.
    const encodedUrl = encodeURIComponent(chapterApiData);
    navigate(`/chapter/${slug}/${encodedUrl}`);
  };

  if (loading) return <Spinner />;
  if (error || !comic) return <div className="text-center py-20 text-red-400">{error || 'Không tìm thấy truyện'}</div>;

  const imageUrl = getImageUrl(domain, comic.thumb_url);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-400 mb-6 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-emerald-400 transition-colors">Trang Chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-white font-medium truncate">{comic.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
        {/* Cover Image */}
        <div className="md:col-span-1">
          <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/20 border border-slate-700 sticky top-24">
            <img src={imageUrl} alt={comic.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-2 lg:col-span-3">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{comic.name}</h1>
            
            <div className="flex flex-wrap gap-3 mb-6">
                {comic.category.map(cat => (
                    <Link 
                        key={cat.id} 
                        to={`/category/${cat.slug}`}
                        className="px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-sm border border-slate-700 hover:bg-slate-700 hover:border-emerald-500 transition-colors"
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <div>
                    <p className="text-slate-500 text-sm mb-1">Trạng Thái</p>
                    <p className="text-white font-medium capitalize">{comic.status === 'ongoing' ? 'Đang tiến hành' : 'Hoàn thành'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-1">Tác Giả</p>
                    <p className="text-white font-medium">{comic.author[0] || 'Đang cập nhật'}</p>
                </div>
                 <div>
                    <p className="text-slate-500 text-sm mb-1">Cập Nhật</p>
                    <p className="text-white font-medium">{new Date(comic.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3 border-l-4 border-emerald-500 pl-3">Nội Dung</h2>
                <div 
                    className={`text-slate-300 leading-relaxed prose prose-invert max-w-none ${!isDescExpanded ? 'line-clamp-4' : ''}`}
                    dangerouslySetInnerHTML={{ __html: comic.content }}
                />
                <button 
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="mt-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                >
                    {isDescExpanded ? 'Thu Gọn' : 'Xem Thêm'}
                </button>
            </div>

            <div>
                <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-emerald-500 pl-3">Danh Sách Chương</h2>
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {comic.chapters.map((server, serverIndex) => (
                        <div key={serverIndex}>
                            {comic.chapters.length > 1 && (
                                <div className="bg-slate-700/50 px-4 py-2 font-semibold text-slate-300 sticky top-0">
                                    {server.server_name}
                                </div>
                            )}
                            <div className="grid grid-cols-1">
                                {server.server_data.map((chapter, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleReadChapter(chapter.chapter_api_data)}
                                        className="text-left px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700 transition-colors flex justify-between items-center group"
                                    >
                                        <span className="text-slate-200 font-medium group-hover:text-white">
                                            Chương {chapter.chapter_name}
                                        </span>
                                        {chapter.chapter_title && (
                                             <span className="text-slate-500 text-sm ml-2 truncate max-w-[200px]">
                                                {chapter.chapter_title}
                                             </span>
                                        )}
                                        <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                                            Đọc
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ComicDetail;