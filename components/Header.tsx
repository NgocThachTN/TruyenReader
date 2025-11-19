import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/categories', label: 'Genres' },
    { path: '/list/truyen-moi', label: 'New Comics' },
    { path: '/list/dang-phat-hanh', label: 'Ongoing' },
    { path: '/list/hoan-thanh', label: 'Completed' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-slate-900/80 border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0" onClick={closeMenu}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
             <span className="font-bold text-white">O</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
            TruyenReader
          </span>
        </Link>
        
        <div className="flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-slate-800 text-slate-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <svg 
                    className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </form>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex gap-6">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className="text-slate-300 hover:text-white font-medium transition-colors text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 absolute w-full left-0 shadow-xl">
          <nav className="container mx-auto px-4 py-4">
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="block py-3 px-4 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;