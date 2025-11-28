import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../services/api";
import { Category } from "../types/types";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "../components/PageTransition";

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchCategories();
        setCategories(result.data.items);
      } catch (err) {
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

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
            Thể loại
          </h1>
          <p className="text-neutral-500 text-sm tracking-widest uppercase pl-5">
            Khám phá kho truyện phong phú
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {categories.map((category) => (
            <motion.div key={category._id} variants={itemVariants}>
              <Link
                to={`/category/${category.slug}`}
                className="group bg-neutral-900 hover:bg-neutral-800 text-neutral-300 p-6 transition-all text-center font-bold text-sm uppercase tracking-wider border border-neutral-800 hover:border-rose-600 hover:text-white hover:-translate-y-1 relative overflow-hidden block"
              >
                <span className="relative z-10">{category.name}</span>
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600/0 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryList;
