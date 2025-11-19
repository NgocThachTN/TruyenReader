import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchComics, getImageUrl } from "../services/api";
import { SearchData } from "../types";

const Header: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SearchData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (keyword.trim()) {
        setIsSearching(true);
        try {
          const result = await searchComics(keyword);
          setSearchResults(result.data);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
      setIsMenuOpen(false);
      setShowDropdown(false);
    }
  };

  const handleResultClick = () => {
    setShowDropdown(false);
    setKeyword("");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { path: "/", label: "Trang Chủ" },
    { path: "/categories", label: "Thể Loại" },
    { path: "/list/truyen-moi", label: "Truyện Mới" },
    { path: "/list/dang-phat-hanh", label: "Đang Phát Hành" },
    { path: "/list/hoan-thanh", label: "Hoàn Thành" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-slate-900/80 border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
          onClick={closeMenu}
        >
          <img
            src="/icon-192x192.svg"
            alt="Logo"
            className="w-10 h-10 rounded-lg"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
            TruyenReader
          </span>
        </Link>

        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => {
                if (keyword.trim() && searchResults) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Tìm kiếm..."
              className="w-full bg-slate-800 text-slate-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <button
              type="submit"
              className="absolute left-3 top-2.5 text-slate-400 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
              {isSearching ? (
                <svg
                  className="animate-spin h-4 w-4 text-emerald-500"
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
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showDropdown &&
            searchResults &&
            searchResults.items &&
            searchResults.items.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                {searchResults.items.slice(0, 8).map((item) => (
                  <Link
                    key={item._id}
                    to={`/comic/${item.slug}`}
                    className="flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0"
                    onClick={handleResultClick}
                  >
                    <div className="w-10 h-14 flex-shrink-0 overflow-hidden rounded shadow-sm">
                      <img
                        src={getImageUrl(
                          searchResults.APP_DOMAIN_CDN_IMAGE,
                          item.thumb_url
                        )}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-200 truncate">
                        {item.name}
                      </h4>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        {item.chaptersLatest &&
                          item.chaptersLatest.length > 0 && (
                            <span className="text-emerald-500">
                              Chương {item.chaptersLatest[0].chapter_name}
                            </span>
                          )}
                        {item.category && item.category.length > 0 && (
                          <>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span className="truncate max-w-[100px]">
                              {item.category[0].name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                <Link
                  to={`/search?keyword=${encodeURIComponent(keyword)}`}
                  className="block p-3 text-center text-sm text-emerald-500 hover:text-emerald-400 hover:bg-slate-800 font-medium transition-colors sticky bottom-0 bg-slate-900 border-t border-slate-800"
                  onClick={handleResultClick}
                >
                  Xem tất cả kết quả cho "{keyword}"
                </Link>
              </div>
            )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
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
          className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 absolute w-full left-0 shadow-xl">
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
