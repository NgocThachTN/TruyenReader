import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchComics } from "../services/api";
import { SearchData } from "../types";
import ComicCard from "../components/ComicCard";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "../components/PageTransition";

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
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
        setError("Tìm kiếm thất bại. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [keyword]);

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

  return (
    <div className="min-h-screen bg-neutral-950 font-sans pb-12">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 border-b border-neutral-800 pb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-rose-600"></span>
            Kết Quả Tìm Kiếm
          </h1>
          <p className="text-neutral-500 text-sm tracking-widest uppercase pl-5">
            Kết quả cho <span className="text-white">"{keyword}"</span>
          </p>
        </motion.div>

        {data && data.items.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {data.items.map((item) => (
              <motion.div key={item._id} variants={itemVariants}>
                <ComicCard
                  comic={item}
                  domain={data.APP_DOMAIN_CDN_IMAGE}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-neutral-500 py-20 flex flex-col items-center justify-center border border-neutral-800 bg-neutral-900/50"
          >
            <svg
              className="w-16 h-16 mb-4 text-neutral-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-sm font-bold uppercase tracking-widest">
              {keyword
                ? "Không tìm thấy truyện nào phù hợp"
                : "Nhập từ khóa để tìm kiếm"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Search;
