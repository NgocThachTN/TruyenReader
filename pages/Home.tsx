import React, { useEffect, useState } from 'react';
import { fetchHomeData, fetchComicList, fetchComicsByCategory } from '../services/api';
import { HomeData, CategoryDetailData } from '../types';
import ComicCard from '../components/ComicCard';
import Spinner from '../components/Spinner';
import Banner from '../components/Banner';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [bannerData, setBannerData] = useState<HomeData | null>(null);
  const [ongoingComics, setOngoingComics] = useState<CategoryDetailData | null>(null);
  const [newComics, setNewComics] = useState<CategoryDetailData | null>(null);
  const [completedComics, setCompletedComics] = useState<CategoryDetailData | null>(null);
  const [mangaComics, setMangaComics] = useState<CategoryDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bannerResult, ongoingResult, newResult, completedResult, mangaResult] = await Promise.all([
            fetchHomeData(),
            fetchComicList('dang-phat-hanh', 1),
            fetchComicList('truyen-moi', 1),
            fetchComicList('hoan-thanh', 1),
            fetchComicsByCategory('manga', 1)
        ]);
        
        setBannerData(bannerResult.data);
        setOngoingComics(ongoingResult.data);
        setNewComics(newResult.data);
        setCompletedComics(completedResult.data);
        setMangaComics(mangaResult.data);
      } catch (err) {
        setError('Không thể tải truyện. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <Spinner />;
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 text-center bg-neutral-950 h-screen">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 font-medium inline-block">
          {error}
        </div>
      </div>
    );
  }

  const SectionHeader = ({ title, subtitle, link }: { title: string, subtitle: string, link: string }) => (
    <div className="flex justify-between items-end mb-8 border-b border-neutral-800 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide mb-1 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-rose-600 block"></span>
              {title}
            </h2>
            <p className="text-neutral-500 text-xs tracking-widest uppercase pl-4.5">{subtitle}</p>
        </div>
        <Link to={link} className="text-neutral-400 hover:text-rose-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors group">
            Xem Tất Cả
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 font-sans pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Banner Section */}
        {bannerData && (
            <Banner comics={bannerData.items} domain={bannerData.APP_DOMAIN_CDN_IMAGE} />
        )}

        {/* Manga Section */}
        {mangaComics && (
            <div className="mt-16">
              <SectionHeader title="Manga Hot" subtitle="Truyện Tranh Nhật Bản" link="/category/manga" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {mangaComics.items.map((item) => (
                  <ComicCard 
                      key={item._id} 
                      comic={item} 
                      domain={mangaComics.APP_DOMAIN_CDN_IMAGE} 
                  />
                  ))}
              </div>
            </div>
        )}

        {/* New Comics Section */}
        {newComics && (
            <div className="mt-16">
              <SectionHeader title="Mới Cập Nhật" subtitle="Chương Mới Nhất" link="/list/truyen-moi" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {newComics.items.map((item) => (
                  <ComicCard 
                      key={item._id} 
                      comic={item} 
                      domain={newComics.APP_DOMAIN_CDN_IMAGE} 
                  />
                  ))}
              </div>
            </div>
        )}

        {/* Ongoing Comics Section */}
        {ongoingComics && (
            <div className="mt-16">
              <SectionHeader title="Đang Phát Hành" subtitle="Truyện Hot Hiện Nay" link="/list/dang-phat-hanh" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {ongoingComics.items.map((item) => (
                  <ComicCard 
                      key={item._id} 
                      comic={item} 
                      domain={ongoingComics.APP_DOMAIN_CDN_IMAGE} 
                  />
                  ))}
              </div>
            </div>
        )}

        {/* Completed Comics Section */}
        {completedComics && (
            <div className="mt-16">
              <SectionHeader title="Đã Hoàn Thành" subtitle="Trọn Bộ" link="/list/hoan-thanh" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {completedComics.items.map((item) => (
                  <ComicCard 
                      key={item._id} 
                      comic={item} 
                      domain={completedComics.APP_DOMAIN_CDN_IMAGE} 
                  />
                  ))}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;
