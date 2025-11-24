import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFavorites, removeFromFavorites } from "../services/be";
import { getImageUrl } from "../services/api";
import { FavoriteItem } from "../types/favorite";
import Spinner from "../components/Spinner";
import { motion, AnimatePresence } from "framer-motion";

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    comicId: string;
    comicName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleRemoveClick = (
    e: React.MouseEvent,
    comicId: string,
    comicName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({ comicId, comicName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await removeFromFavorites(deleteConfirm.comicId);
      setFavorites(
        favorites.filter((item) => item.comicId !== deleteConfirm.comicId)
      );
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || "Không thể xóa truyện khỏi danh sách yêu thích");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 sm:mb-10 border-b border-neutral-800 pb-4 sm:pb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-tight flex items-center gap-2 sm:gap-3">
              <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-rose-600"></span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {favorites.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="relative">
                    <Link
                      to={`/comic/${item.comicSlug || item.comicId}`}
                      className="block"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-900 mb-3 border border-neutral-800 shadow-lg group-hover:shadow-rose-900/20 transition-all duration-300 rounded-lg">
                        <img
                          src={getImageUrl(CDN_DOMAIN, item.comicThumb)}
                          alt={item.comicName}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/300x450?text=No+Image";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </div>
                    </Link>

                    {/* Nút xóa - luôn hiển thị, tối ưu cho mobile */}
                    <button
                      onClick={(e) =>
                        handleRemoveClick(e, item.comicId, item.comicName)
                      }
                      className="absolute top-2 right-2 p-2 sm:p-2.5 bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 z-10 touch-manipulation"
                      title="Xóa khỏi yêu thích"
                      aria-label="Xóa khỏi yêu thích"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-neutral-200 group-hover:text-rose-500 transition-colors line-clamp-2 leading-snug px-1">
                    {item.comicName}
                  </h3>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden"
            >
              <div className="h-1 w-full bg-gradient-to-r from-rose-600 via-rose-500 to-orange-400"></div>

              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-600/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-rose-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      Xóa khỏi yêu thích?
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Bạn có chắc muốn xóa{" "}
                      <span className="font-semibold text-white">
                        {deleteConfirm.comicName}
                      </span>{" "}
                      khỏi danh sách yêu thích?
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="px-4 py-2.5 text-sm font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                  >
                    {isDeleting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang xóa...
                      </>
                    ) : (
                      "Xóa"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Favorites;
