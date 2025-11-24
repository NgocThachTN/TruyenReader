import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchComicDetail, getImageUrl } from "../services/api";
import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  getComments,
  addComment,
} from "../services/be";
import { ComicDetailItem } from "../types/types";
import { CommentItem } from "../types/auth";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";

const ComicDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [comic, setComic] = useState<ComicDetailItem | null>(null);
  const [domain, setDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;

    const loadDetail = async () => {
      setLoading(true);
      try {
        const result = await fetchComicDetail(slug);
        // Sort chapters from newest (highest number) to oldest (lowest number)
        result.data.item.chapters.forEach((server) => {
          server.server_data.sort((a, b) => {
            return parseFloat(b.chapter_name) - parseFloat(a.chapter_name);
          });
        });
        setComic(result.data.item);
        setDomain(result.data.APP_DOMAIN_CDN_IMAGE);

        // Check if comic is already in favorites
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const favResponse = await getFavorites();
            const isFav = favResponse.favorites.some(
              (fav) =>
                fav.comicId === result.data.item._id ||
                fav.comicSlug === result.data.item.slug
            );
            setIsFavorite(isFav);
          } catch (error) {
            console.error("Failed to check favorites:", error);
          }
        }

        // Load comments
        loadComments(slug);
      } catch (err) {
        setError("Không thể tải thông tin truyện.");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [slug]);

  const loadComments = async (comicSlug: string) => {
    setLoadingComments(true);
    try {
      const response = await getComments(comicSlug);
      // Sort comments by newest first if not already sorted
      const sortedComments = response.comments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!comic) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để bình luận!");
      navigate("/login");
      return;
    }

    setSubmittingComment(true);
    try {
      await addComment({
        comicId: comic._id,
        comicSlug: comic.slug,
        content: newComment,
      });
      setNewComment("");
      // Reload comments to show the new one
      await loadComments(comic.slug);
    } catch (error: any) {
      alert(error.message || "Không thể đăng bình luận.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReadChapter = (chapterApiData: string) => {
    const encodedUrl = encodeURIComponent(chapterApiData);
    navigate(`/chapter/${slug}/${encodedUrl}`);
  };

  const handleAddToFavorites = async () => {
    if (!comic) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
      navigate("/login");
      return;
    }

    if (isFavorite) {
      const confirmRemove = window.confirm(
        "Bạn có chắc muốn xóa truyện này khỏi danh sách yêu thích?"
      );
      if (!confirmRemove) return;

      setIsAddingFavorite(true);
      try {
        await removeFromFavorites(comic._id);
        setIsFavorite(false);
        alert("Đã xóa khỏi danh sách yêu thích!");
      } catch (err: any) {
        alert(err.message || "Có lỗi xảy ra khi xóa khỏi yêu thích.");
      } finally {
        setIsAddingFavorite(false);
      }
      return;
    }

    setIsAddingFavorite(true);
    try {
      await addToFavorites({
        comicId: comic._id,
        comicName: comic.name,
        comicThumb: comic.thumb_url,
        comicSlug: comic.slug,
      });
      setIsFavorite(true);
      alert("Đã thêm vào danh sách yêu thích!");
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi thêm vào yêu thích.");
    } finally {
      setIsAddingFavorite(false);
    }
  };

  if (loading) return <Spinner />;
  if (error || !comic)
    return (
      <div className="text-center py-20 text-rose-400 bg-neutral-950 h-screen flex items-center justify-center">
        {error || "Không tìm thấy truyện"}
      </div>
    );

  const imageUrl = getImageUrl(domain, comic.thumb_url);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans pb-12">
      {/* Hero Section / Banner with Blur Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[23vh] md:h-[30vh] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-neutral-950 to-transparent z-20"></div>
      </motion.div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 max-w-5xl relative z-30 -mt-32">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Cover Image - Floating card style */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex-shrink-0 mx-auto md:mx-0 w-48 md:w-64 lg:w-72 group perspective"
          >
            <div className="relative aspect-[2/3] bg-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_60px_rgba(225,29,72,0.15)] transition-all duration-500 transform md:group-hover:-translate-y-2 overflow-hidden border border-neutral-800">
              <img
                src={imageUrl}
                alt={comic.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10"></div>
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex-1 pt-4 md:pt-12 text-center md:text-left"
          >
            <div className="mb-2 flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-wider text-rose-500 uppercase">
              <span>Manga</span>
              <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
              <span>
                {comic.status === "ongoing" ? "Đang tiến hành" : "Hoàn thành"}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
              {comic.name}
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
              {comic.category.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="px-3 py-1 text-xs font-medium bg-neutral-900 border border-neutral-800 hover:border-rose-500 hover:text-rose-500 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 border-y border-neutral-800 py-6">
              <div className="text-center md:text-left">
                <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">
                  Tác Giả
                </p>
                <p className="text-white font-medium">
                  {comic.author[0] !== "Đang cập nhật" && comic.author[0] !== ""
                    ? comic.author.join(", ")
                    : "Đang cập nhật"}
                </p>
              </div>
              <div className="text-center md:text-left border-l border-neutral-800 md:pl-8">
                <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">
                  Cập Nhật
                </p>
                <p className="text-white font-medium">
                  {new Date(comic.updatedAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              {comic.chapters[0]?.server_data.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const firstChapter =
                      comic.chapters[0].server_data[
                        comic.chapters[0].server_data.length - 1
                      ];
                    handleReadChapter(firstChapter.chapter_api_data);
                  }}
                  className="w-full md:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-900/20 transition-all"
                >
                  Đọc Từ Đầu
                </motion.button>
              )}
              {comic.chapters[0]?.server_data.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    handleReadChapter(
                      comic.chapters[0].server_data[0].chapter_api_data
                    )
                  }
                  className="w-full md:w-auto px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm uppercase tracking-wider border border-neutral-700 transition-all"
                >
                  Chương Mới Nhất
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToFavorites}
                disabled={isAddingFavorite}
                className={`w-full md:w-auto px-8 py-3 font-bold text-sm uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                  isFavorite
                    ? "bg-rose-900 text-rose-100 border-rose-800 hover:bg-red-900"
                    : "bg-rose-900/50 hover:bg-rose-900/80 text-rose-100 border-rose-800/50"
                }`}
              >
                {isAddingFavorite ? (
                  <svg
                    className="animate-spin h-4 w-4 text-rose-100"
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
                ) : isFavorite ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                )}
                {isFavorite ? "Bỏ Yêu Thích" : "Yêu Thích"}
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Content - Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 lg:col-start-2"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-rose-600"></span>
              Nội Dung
            </h3>
            <div className="bg-neutral-900/50 p-6 border border-neutral-800">
              <div
                className={`text-neutral-400 leading-relaxed text-sm md:text-base ${
                  !isDescExpanded ? "line-clamp-4" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: comic.content }}
              />
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="mt-4 text-rose-500 hover:text-rose-400 text-sm font-bold uppercase tracking-wider flex items-center gap-1"
              >
                {isDescExpanded ? "Thu Gọn" : "Xem Thêm"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-4 h-4 transition-transform ${
                    isDescExpanded ? "rotate-180" : ""
                  }`}
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Chapters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:row-span-2"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-rose-600"></span>
              Danh Sách Chương
            </h3>
            <div className="bg-neutral-900 border border-neutral-800 max-h-[600px] overflow-y-auto custom-scrollbar">
              {comic.chapters.map((server, serverIndex) => (
                <div key={serverIndex}>
                  {comic.chapters.length > 1 && (
                    <div className="bg-neutral-800 px-4 py-2 text-xs font-bold text-neutral-400 sticky top-0 uppercase tracking-wider border-b border-neutral-700">
                      {server.server_name}
                    </div>
                  )}
                  <div>
                    {server.server_data.map((chapter, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleReadChapter(chapter.chapter_api_data)
                        }
                        className="w-full text-left px-5 py-3.5 border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors flex justify-between items-center group"
                      >
                        <div className="flex flex-col">
                          <span className="text-neutral-300 font-medium text-sm group-hover:text-white group-hover:translate-x-1 transition-all">
                            Chương {chapter.chapter_name}
                          </span>
                          {chapter.chapter_title && (
                            <span className="text-neutral-600 text-xs mt-0.5 truncate max-w-[200px]">
                              {chapter.chapter_title}
                            </span>
                          )}
                        </div>
                        <span className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold uppercase -translate-x-2 group-hover:translate-x-0">
                          Đọc
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 lg:col-start-2"
          >
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-6 bg-rose-600"></span>
                Bình Luận ({comments.length})
              </h3>

              {/* Comment Form */}
              <div className="bg-neutral-900/50 p-6 border border-neutral-800 mb-8">
                <form onSubmit={handlePostComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ cảm nghĩ của bạn về truyện này..."
                    className="w-full bg-neutral-950 border border-neutral-700 p-4 text-neutral-200 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-all resize-y min-h-[100px]"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submittingComment && (
                        <svg
                          className="animate-spin h-4 w-4 text-white"
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
                      )}
                      Gửi Bình Luận
                    </button>
                  </div>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-0 border border-neutral-800 bg-neutral-900/30">
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-6 border-b border-neutral-800 last:border-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-rose-500 font-bold text-lg flex-shrink-0">
                          {comment.user?.fullname
                            ? comment.user.fullname.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white">
                              {comment.user?.fullname || "Người dùng ẩn danh"}
                            </h4>
                            <span className="text-xs text-neutral-500">
                              {new Date(comment.createdAt).toLocaleString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                          <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ComicDetail;
