import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getHistory,
  HistoryItem,
  removeFromHistory,
  clearHistory,
} from "../services/history";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants } from "../components/PageTransition";
import Spinner from "../components/Spinner";

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (slug: string) => {
    if (window.confirm("Bạn có chắc muốn xóa truyện này khỏi lịch sử?")) {
      try {
        const newHistory = await removeFromHistory(slug);
        setHistory(newHistory);
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử?")) {
      setLoading(true);
      try {
        await clearHistory();
        setHistory([]);
      } catch (error) {
        console.error("Failed to clear history:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-neutral-400">
        <motion.svg
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.5 }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-16 h-16"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </motion.svg>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium"
        >
          Chưa có lịch sử đọc truyện
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/"
            className="px-6 py-2 bg-rose-600 text-white rounded-full font-bold hover:bg-rose-700 transition-colors inline-block"
          >
            Khám phá ngay
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-sans pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-rose-600"></span>
            Lịch Sử Đọc
          </h1>
          <button
            onClick={handleClearAll}
            className="text-sm text-rose-500 hover:text-rose-400 font-bold uppercase tracking-wider transition-colors"
          >
            Xóa tất cả
          </button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {history.map((item) => (
              <motion.div
                key={item.comicId}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-neutral-900 border border-neutral-800 hover:border-rose-600/50 transition-colors group flex overflow-hidden rounded-lg"
              >
                <Link
                  to={`/comic/${item.comicSlug}`}
                  className="w-24 sm:w-32 shrink-0 bg-neutral-800 relative overflow-hidden"
                >
                  <img
                    src={item.comicThumb}
                    alt={item.comicName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </Link>

                <div className="flex-1 p-4 flex flex-col">
                  <Link to={`/comic/${item.comicSlug}`}>
                    <h3 className="font-bold text-neutral-200 group-hover:text-rose-500 transition-colors line-clamp-1 mb-1">
                      {item.comicName}
                    </h3>
                  </Link>

                  <div className="text-xs text-neutral-500 mb-4">
                    Đã đọc:{" "}
                    {new Date(item.lastReadAt).toLocaleDateString("vi-VN")}{" "}
                    {new Date(item.lastReadAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div className="mt-auto flex items-center gap-3">
                    {item.chapterApiData ? (
                      <Link
                        to={`/chapter/${item.comicSlug}/${encodeURIComponent(
                          item.chapterApiData
                        )}`}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-3 rounded text-center transition-colors truncate"
                      >
                        Đọc tiếp Chapter {item.chapterName}
                      </Link>
                    ) : (
                      <span className="flex-1 bg-neutral-800 text-neutral-500 text-xs font-bold py-2 px-3 rounded text-center cursor-not-allowed">
                        Chapter {item.chapterName}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(item.comicSlug)}
                      className="p-2 text-neutral-500 hover:text-red-500 transition-colors bg-neutral-800 hover:bg-neutral-800/80 rounded"
                      title="Xóa khỏi lịch sử"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
