import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../services/api';
import { Category } from '../types';
import Spinner from '../components/Spinner';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchCategories();
        setCategories(result.data.items);
      } catch (err) {
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Genres</h1>
        <p className="text-slate-400">Explore comics by category</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/category/${category.slug}`}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-4 rounded-lg transition-colors text-center font-medium border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
