import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFavorites, removeFromFavorites } from "../services/be";
import { getImageUrl } from "../services/api";
import { FavoriteItem } from "../types/auth";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Hardcoded domain for now as it's not returned by favorites API
  // In a real app, this might come from a config or another API call
  const CDN_DOMAIN = "https://otruyenapi.com";

  useEffect(() => {
    fetchFavorites();
  }, [navigate]);

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data.favorites);
    } catch (err: any) {
      if (err.message.includes("cần đăng nhập")) {
        navigate("/login");
        return;
      }
      setError("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (e: React.MouseEvent, comicId: string) => {
    e.preventDefault(); // Prevent navigation to detail page
    e.stopPropagation();

    if (
      !window.confirm(
        "Bạn có chắc muốn xóa truyện này khỏi danh sách yêu thích?"
      )
    ) {
      return;
    }

    try {
      await removeFromFavorites(comicId);
      // Update list immediately
      setFavorites(favorites.filter((item) => item.comicId !== comicId));
    } catch (err: any) {
      alert(err.message || "Không thể xóa truyện khỏi danh sách yêu thích");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10 border-b border-neutral-800 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-rose-600"></span>
              Truyện Đã Thích
            </h1>
          </div>

          {error && (
            <div className="text-center py-10 bg-neutral-900 border border-rose-900/30">
              <p className="text-rose-500">{error}</p>
            </div>
          )}

          {!error && favorites.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900 border border-neutral-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 mx-auto text-neutral-700 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              <p className="text-neutral-400 text-lg mb-6">
                Bạn chưa có truyện yêu thích nào.
              </p>
              <Link
                to="/"
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm uppercase tracking-wider transition-colors inline-block"
              >
                Khám phá truyện ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {favorites.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={`/comic/${item.comicSlug || item.comicId}`}
                    className="group block h-full"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-neutral-900 mb-3 border border-neutral-800 shadow-lg group-hover:shadow-rose-900/20 transition-all duration-300">
                      <img
                        src={getImageUrl(CDN_DOMAIN, item.comicThumb)}
                        alt={item.comicName}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback if image fails
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/300x450?text=No+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <button
                        onClick={(e) => handleRemoveFavorite(e, item.comicId)}
                        className="absolute top-0 right-0 p-2 bg-rose-600 hover:bg-rose-700 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                        title="Xóa khỏi yêu thích"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-neutral-200 group-hover:text-rose-500 transition-colors line-clamp-2 leading-snug">
                      {item.comicName}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Favorites;
