import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchComics, getImageUrl } from "../services/api";
import { SearchData } from "../types/types";
import ChangePasswordModal from "./ChangePasswordModal";
import { logoutUser } from "../services/be";

const Header: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SearchData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const checkUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("user:updated", checkUser as EventListener);

    // Also listen for custom storage events from same window
    const handleStorageChange = () => checkUser();
    window.addEventListener("storage", handleStorageChange);

    // Listen for session expired event to clear user immediately
    const handleSessionExpired = () => {
      setUser(null);
      setShowUserMenu(false);
    };
    window.addEventListener("auth:sessionExpired", handleSessionExpired);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user:updated", checkUser as EventListener);
      window.removeEventListener("auth:sessionExpired", handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
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
      setIsMobileSearchOpen(false);
    }
  };

  const handleResultClick = () => {
    setShowDropdown(false);
    setKeyword("");
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error: any) {
      console.error("Logout failed", error);
      alert(error?.message || "Đăng xuất thất bại, vui lòng thử lại.");
    } finally {
      setUser(null);
      setShowUserMenu(false);
      navigate("/login");
    }
  };

  const openChangePassword = () => {
    setShowUserMenu(false);
    setIsChangePasswordOpen(true);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Helper function to get display name with fallback
  const getDisplayName = (user: any): string => {
    if (!user) return "User";
    return (
      user.fullname ||
      user.name ||
      user.displayName ||
      user.given_name ||
      (user.email && user.email.split("@")[0]) ||
      "User"
    );
  };

  const getAvatarSrc = () => {
    if (!user?.avatar) return "";
    const separator = user.avatar.includes("?") ? "&" : "?";
    const version = user.avatarVersion;
    return version ? `${user.avatar}${separator}v=${version}` : user.avatar;
  };

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar, user?.avatarVersion]);

  const renderAvatar = (sizeClass: string, textClass = "") => {
    const displayName = getDisplayName(user);
    const avatarSrc = getAvatarSrc();
    if (avatarSrc && !avatarError) {
      return (
        <img
          src={avatarSrc}
          alt={displayName}
          className={`${sizeClass} rounded-full object-cover border border-neutral-800`}
          onError={() => setAvatarError(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      );
    }

    return (
      <div
        className={`${sizeClass} rounded-full bg-rose-600 flex items-center justify-center text-white font-bold ${textClass}`}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
    );
  };

  const navLinks = [
    { path: "/", label: "Trang Chủ" },
    { path: "/categories", label: "Thể Loại" },
    { path: "/list/truyen-moi", label: "Mới Cập Nhật" },
    { path: "/list/dang-phat-hanh", label: "Đang Phát Hành" },
    { path: "/list/hoan-thanh", label: "Hoàn Thành" },
  ];

  // Add auth links only if not logged in
  if (!user) {
    navLinks.push({ path: "/register", label: "Đăng Ký" });
    navLinks.push({ path: "/login", label: "Đăng Nhập" });
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-neutral-950/80 border-b border-neutral-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-6">
        {/* Logo Area */}
        <Link
          to="/"
          className={`flex items-center gap-3 group shrink-0 ${
            isMobileSearchOpen ? "hidden md:flex" : "flex"
          }`}
          onClick={closeMenu}
        >
          <img
            src="/icon-192x192.svg"
            alt="TruyenReader Logo"
            className="w-10 h-10 rounded-md object-contain"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white leading-none group-hover:text-rose-500 transition-colors">
              TruyenReader
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Centered & Minimal */}
        <nav className="hidden lg:block">
          <ul className="flex gap-8">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="text-neutral-400 hover:text-white font-medium text-sm uppercase tracking-wide transition-colors relative py-2 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 transition-all group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Search Trigger */}
        {!isMobileSearchOpen && (
          <button
            className="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors ml-auto"
            onClick={() => {
              setIsMobileSearchOpen(true);
              setIsMenuOpen(false);
            }}
            aria-label="Open search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>
        )}

        {/* Search Bar */}
        <div
          className={`${
            isMobileSearchOpen
              ? "absolute inset-0 z-50 bg-neutral-950 flex items-center px-4 w-full h-full"
              : "hidden lg:block flex-1 max-w-xs relative lg:ml-0"
          }`}
          ref={searchRef}
        >
          {isMobileSearchOpen && (
            <button
              className="mr-3 text-neutral-400 hover:text-white p-1"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </button>
          )}

          <form onSubmit={handleSearch} className="relative group w-full">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => {
                if (keyword.trim() && searchResults) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Tìm truyện..."
              className="w-full bg-neutral-900 text-neutral-200 border border-neutral-800 py-2 pl-4 pr-10 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-all text-sm placeholder:text-neutral-600"
              autoFocus={isMobileSearchOpen}
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-neutral-500 group-focus-within:text-rose-500 transition-colors"
            >
              {isSearching ? (
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
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 shadow-2xl max-h-[80vh] overflow-y-auto z-50 mx-2 md:mx-0 rounded-lg">
                {searchResults.items.slice(0, 6).map((item) => (
                  <Link
                    key={item._id}
                    to={`/comic/${item.slug}`}
                    className="flex items-start gap-3 p-3 hover:bg-neutral-800 transition-colors border-b border-neutral-800 last:border-0 group"
                    onClick={handleResultClick}
                  >
                    <div className="w-12 h-16 flex-shrink-0 overflow-hidden bg-neutral-800 rounded">
                      <img
                        src={getImageUrl(
                          searchResults.APP_DOMAIN_CDN_IMAGE,
                          item.thumb_url
                        )}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-neutral-200 truncate group-hover:text-rose-500 transition-colors">
                        {item.name}
                      </h4>
                      <div className="text-xs text-neutral-500 mt-1">
                        {item.chaptersLatest &&
                          item.chaptersLatest.length > 0 && (
                            <span className="text-neutral-400">
                              {item.chaptersLatest[0].chapter_name
                                ? `Chương ${item.chaptersLatest[0].chapter_name}`
                                : "Đang cập nhật"}
                            </span>
                          )}
                      </div>
                    </div>
                  </Link>
                ))}
                <Link
                  to={`/search?keyword=${encodeURIComponent(keyword)}`}
                  className="block p-3 text-center text-xs uppercase tracking-wider font-bold text-rose-500 hover:bg-neutral-800 hover:text-white transition-colors sticky bottom-0 bg-neutral-900 border-t border-neutral-800"
                  onClick={handleResultClick}
                >
                  Xem tất cả
                </Link>
              </div>
            )}
        </div>

        {/* User Avatar / Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-neutral-200 hover:text-white transition-colors"
              >
                {renderAvatar("w-8 h-8")}
                <span className="text-sm font-medium hidden xl:block">
                  {getDisplayName(user)}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-neutral-800">
                    <p className="text-sm text-white font-medium truncate">
                      {getDisplayName(user)}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                  >
                    Trang cá nhân
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                  >
                    Truyện yêu thích
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                  >
                    Lịch sử đọc
                  </Link>
                  <button
                    onClick={openChangePassword}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-neutral-800 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        {!isMobileSearchOpen && (
          <button
            className="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors"
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
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-neutral-950 border-t border-neutral-800 absolute w-full left-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="container mx-auto px-4 py-6">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="block py-3 text-xl font-bold text-neutral-400 hover:text-rose-500 transition-colors"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user && (
                <li className="pt-4 border-t border-neutral-800 mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    {renderAvatar("w-10 h-10", "text-lg")}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-base truncate">
                        {getDisplayName(user)}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block w-full text-left py-3 text-xl font-bold text-neutral-400 hover:text-white transition-colors border-b border-neutral-800 mb-2"
                    onClick={closeMenu}
                  >
                    Trang cá nhân
                  </Link>
                  <Link
                    to="/favorites"
                    className="block w-full text-left py-3 text-xl font-bold text-neutral-400 hover:text-white transition-colors border-b border-neutral-800 mb-2"
                    onClick={closeMenu}
                  >
                    Truyện yêu thích
                  </Link>
                  <Link
                    to="/history"
                    className="block w-full text-left py-3 text-xl font-bold text-neutral-400 hover:text-white transition-colors border-b border-neutral-800 mb-2"
                    onClick={closeMenu}
                  >
                    Lịch sử đọc
                  </Link>
                  <button
                    onClick={() => {
                      openChangePassword();
                      closeMenu();
                    }}
                    className="block w-full text-left py-3 text-xl font-bold text-neutral-400 hover:text-white transition-colors border-b border-neutral-800 mb-2"
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="block w-full text-left py-3 text-xl font-bold text-rose-500 hover:text-rose-400 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
};

export default Header;
