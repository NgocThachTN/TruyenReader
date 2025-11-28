import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white px-4">
      <div className="text-center max-w-md">
        <p className="text-sm font-semibold text-rose-500 uppercase tracking-[0.2em] mb-4">
          404 • Không tìm thấy trang
        </p>
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Lạc vào{" "}
          <span className="text-rose-500 border-b-2 border-rose-600">
            hư không
          </span>
        </h1>
        <p className="text-neutral-400 mb-8">
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa. Thử quay lại
          trang chủ và tiếp tục hành trình khám phá truyện nhé.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-none bg-rose-600 hover:bg-rose-700 text-sm font-bold uppercase tracking-wide shadow-lg shadow-rose-900/30 transition"
          >
            Về trang chủ
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center justify-center px-6 py-3 rounded-none border border-neutral-700 text-sm font-bold uppercase tracking-wide text-neutral-200 hover:bg-neutral-900 transition"
          >
            Tìm truyện khác
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


