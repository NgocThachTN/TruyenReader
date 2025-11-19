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
        // Fetch Banner Data and lists in parallel
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
        setError('Failed to load comics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* Banner Section */}
      {bannerData && (
          <Banner comics={bannerData.items} domain={bannerData.APP_DOMAIN_CDN_IMAGE} />
      )}

      {/* Manga Section */}
      {mangaComics && (
          <div className="mt-12">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Manga</h1>
                    <p className="text-slate-400">Top Manga Series</p>
                </div>
                <Link to="/category/manga" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center gap-1">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
          <div className="mt-12">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">New Comics</h1>
                    <p className="text-slate-400">Fresh manga releases</p>
                </div>
                <Link to="/list/truyen-moi" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center gap-1">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
          <div className="mt-12">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Ongoing Series</h1>
                    <p className="text-slate-400">Top ongoing manga right now</p>
                </div>
                <Link to="/list/dang-phat-hanh" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center gap-1">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
          <div className="mt-12">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Completed Series</h1>
                    <p className="text-slate-400">Fully released manga</p>
                </div>
                <Link to="/list/hoan-thanh" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center gap-1">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
  );
};

export default Home;