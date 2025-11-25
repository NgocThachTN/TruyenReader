import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, loginUser, API_BASE_URL } from "../services/be";
import { RegisterData } from "../types/auth";
import { motion } from "framer-motion";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmpassword: "",
    fullname: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.email || !formData.password || !formData.fullname) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (formData.password !== formData.confirmpassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(formData);

      // Auto login after registration
      const loginResponse = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Save user info and token to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(loginResponse.user || { email: formData.email })
      );
      localStorage.setItem("token", loginResponse.token || "dummy-token");

      // Trigger a custom event so Header can update
      window.dispatchEvent(new Event("storage"));

      // Show success message or redirect
      alert("Đăng ký thành công!");
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đăng ký.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-950 font-sans">
      {/* Left Side - Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 items-center justify-center overflow-hidden border-r border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-rose-900/40 via-neutral-950 to-neutral-950 z-10"></div>

        {/* Decorative Background Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 z-0 select-none pointer-events-none">
          <span className="text-[20vw] font-black text-white leading-none rotate-90 whitespace-nowrap">
            OTRUYEN
          </span>
        </div>

        <div className="relative z-20 text-center px-12 max-w-xl">
          <div className="mb-8 inline-block p-4 border-4 border-rose-600">
            <span className="text-4xl font-black text-white tracking-widest">
              THAM GIA
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
            Tạo tài khoản <span className="text-rose-500">miễn phí</span>
          </h2>
          <p className="text-neutral-400 text-lg leading-relaxed">
            Lưu lại lịch sử đọc, đánh dấu truyện yêu thích và nhận thông báo khi
            có chương mới. Tất cả đều miễn phí.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-10"
        >
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Đăng Ký
            </h2>
            <p className="mt-3 text-neutral-400 text-sm">
              Điền thông tin bên dưới để tạo tài khoản mới.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="group">
                <label
                  htmlFor="fullname"
                  className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 group-focus-within:text-rose-500 transition-colors"
                >
                  Họ và tên
                </label>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  className="block w-full px-0 py-3 border-b-2 border-neutral-800 bg-transparent text-white placeholder-neutral-700 focus:border-rose-600 focus:outline-none transition-colors text-lg"
                  placeholder="Nguyen Van A"
                  value={formData.fullname}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label
                  htmlFor="email-address"
                  className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 group-focus-within:text-rose-500 transition-colors"
                >
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-0 py-3 border-b-2 border-neutral-800 bg-transparent text-white placeholder-neutral-700 focus:border-rose-600 focus:outline-none transition-colors text-lg"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 group-focus-within:text-rose-500 transition-colors"
                >
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full px-0 py-3 border-b-2 border-neutral-800 bg-transparent text-white placeholder-neutral-700 focus:border-rose-600 focus:outline-none transition-colors text-lg"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label
                  htmlFor="confirmpassword"
                  className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 group-focus-within:text-rose-500 transition-colors"
                >
                  Nhập lại mật khẩu
                </label>
                <input
                  id="confirmpassword"
                  name="confirmpassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full px-0 py-3 border-b-2 border-neutral-800 bg-transparent text-white placeholder-neutral-700 focus:border-rose-600 focus:outline-none transition-colors text-lg"
                  placeholder="••••••••"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-500 text-sm bg-rose-500/5 border-l-2 border-rose-500 py-3 px-4"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider shadow-lg shadow-rose-900/20 hover:shadow-rose-900/40"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                ) : null}
                {isLoading ? "Đang xử lý..." : "Tạo Tài Khoản"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-neutral-950 text-neutral-500 uppercase font-bold text-xs tracking-wider">
                    Hoặc đăng nhập bằng
                  </span>
                </div>
              </div>

              <a
                href={`${API_BASE_URL}/auth/google`}
                className="w-full flex justify-center items-center py-4 px-4 border border-neutral-800 text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-700 transition-all uppercase tracking-wider"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                Google
              </a>

              <div className="text-center mt-6">
                <p className="text-neutral-500 text-sm">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-white hover:text-rose-500 transition-colors underline decoration-neutral-700 hover:decoration-rose-500 underline-offset-4"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>

              <div className="text-center pt-4">
                <Link
                  to="/"
                  className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors flex items-center justify-center gap-2"
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
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  Về Trang Chủ
                </Link>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
