import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchComicDetail, getImageUrl } from "../services/api";
import { ComicDetailItem } from "../types";
import Spinner from "../components/Spinner";

const ComicDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [comic, setComic] = useState<ComicDetailItem | null>(null);
  const [domain, setDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

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
      } catch (err) {
        setError("Không thể tải thông tin truyện.");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [slug]);

  const handleReadChapter = (chapterApiData: string) => {
    const encodedUrl = encodeURIComponent(chapterApiData);
    navigate(`/chapter/${slug}/${encodedUrl}`);
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
      <div className="relative h-[23vh] md:h-[30vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-neutral-950 to-transparent z-20"></div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 max-w-5xl relative z-30 -mt-32">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Cover Image - Floating card style */}
          <div className="flex-shrink-0 mx-auto md:mx-0 w-48 md:w-64 lg:w-72 group perspective">
            <div className="relative aspect-[2/3] bg-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_60px_rgba(225,29,72,0.15)] transition-all duration-500 transform md:group-hover:-translate-y-2 overflow-hidden border border-neutral-800">
              <img
                src={imageUrl}
                alt={comic.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10"></div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 pt-4 md:pt-12 text-center md:text-left">
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
                  {comic.author[0] !== "Đang cập nhật"
                    ? comic.author.join(", ")
                    : "Unknown"}
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
              {comic.chapters[0]?.server_data[0] && (
                <button
                  onClick={() =>
                    handleReadChapter(
                      comic.chapters[0].server_data[0].chapter_api_data
                    )
                  }
                  className="w-full md:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-900/20 transition-all hover:-translate-y-0.5"
                >
                  Đọc Từ Đầu
                </button>
              )}
              {comic.chapters[0]?.server_data.length > 0 && (
                <button
                  onClick={() => {
                    const last =
                      comic.chapters[0].server_data[
                        comic.chapters[0].server_data.length - 1
                      ];
                    handleReadChapter(last.chapter_api_data);
                  }}
                  className="w-full md:w-auto px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm uppercase tracking-wider border border-neutral-700 transition-all hover:-translate-y-0.5"
                >
                  Chương Mới Nhất
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Content - Order 2 on Desktop (Right), Order 1 on Mobile (Top) */}
          <div className="lg:col-span-2 lg:order-2">
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
          </div>

          {/* Chapters - Order 1 on Desktop (Left), Order 2 on Mobile (Bottom) */}
          <div className="lg:col-span-1 lg:order-1">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicDetail;
