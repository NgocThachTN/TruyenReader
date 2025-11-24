import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../services/be";
import { motion, AnimatePresence } from "framer-motion";

type Step = "email" | "otp" | "password";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Vui lòng nhập email của bạn.");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess("Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư.");
      setTimeout(() => {
        setStep("otp");
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Không thể gửi email. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otp) {
      setError("Vui lòng nhập mã OTP.");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({ email, otp });
      setSuccess("Xác nhận OTP thành công!");
      setTimeout(() => {
        setStep("password");
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Mã OTP không hợp lệ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ email, newPassword });
      setSuccess("Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen flex bg-neutral-950 font-sans">
      {/* Left Side - Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 items-center justify-center overflow-hidden border-r border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-rose-900/40 via-neutral-950 to-neutral-950 z-10"></div>

        {/* Decorative Background Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 z-0 select-none pointer-events-none">
          <span className="text-[20vw] font-black text-white leading-none rotate-90 whitespace-nowrap">
            RESET
          </span>
        </div>

        <div className="relative z-20 text-center px-12 max-w-xl">
          <div className="mb-8 inline-block p-4 border-4 border-rose-600">
            <span className="text-4xl font-black text-white tracking-widest">
              QUÊN MẬT KHẨU
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
            Khôi phục tài khoản{" "}
            <span className="text-rose-500">của bạn</span>
          </h2>
          <p className="text-neutral-400 text-lg leading-relaxed">
            Nhập email để nhận mã OTP, sau đó đặt lại mật khẩu mới cho tài khoản
            của bạn.
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
              Quên Mật Khẩu
            </h2>
            <p className="mt-3 text-neutral-400 text-sm">
              {step === "email" &&
                "Nhập email của bạn để nhận mã OTP."}
              {step === "otp" &&
                "Nhập mã OTP đã được gửi đến email của bạn."}
              {step === "password" &&
                "Nhập mật khẩu mới cho tài khoản của bạn."}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`h-2 w-16 transition-all ${
                step === "email" ? "bg-rose-600" : "bg-rose-600"
              }`}
            />
            <div
              className={`h-2 w-16 transition-all ${
                step === "otp" || step === "password"
                  ? "bg-rose-600"
                  : "bg-neutral-800"
              }`}
            />
            <div
              className={`h-2 w-16 transition-all ${
                step === "password" ? "bg-rose-600" : "bg-neutral-800"
              }`}
            />
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === "email" && (
              <motion.form
                key="email"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8"
                onSubmit={handleSendEmail}
              >
                <div className="space-y-6">
                  <div className="group">
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 group-focus-within:text-rose-500 transition-colors"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full px-0 py-3 border-b-2 border-neutral-800 bg-transparent text-white placeholder-neutral-700 focus:border-rose-600 focus:outline-none transition-colors text-lg"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      autoFocus
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

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 text-sm bg-emerald-500/5 border-l-2 border-emerald-500 py-3 px-4"
                  >
                    {success}
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
                    {isLoading ? "Đang gửi..." : "Gửi Mã OTP"}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 2: OTP */}
            {step === "otp" && (
              <motion.form
                key="otp"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8"
                onSubmit={handleVerifyOtp}
              >
                <div className="space-y-6">
                  <div className="group">
                    <label
                      htmlFor="otp"
                      className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 group-focus-within:text-rose-500 transition-colors"
                    >
                      Mã OTP
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      maxLength={6}
                      className="block w-full px-0 py-3 border-b-2 border-neutral-800 bg-transparent text-white placeholder-neutral-700 focus:border-rose-600 focus:outline-none transition-colors text-lg text-center tracking-widest text-2xl"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        if (error) setError(null);
                      }}
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-neutral-500 text-center">
                      Mã OTP đã được gửi đến: <span className="text-rose-400">{email}</span>
                    </p>
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

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 text-sm bg-emerald-500/5 border-l-2 border-emerald-500 py-3 px-4"
                  >
                    {success}
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
                    {isLoading ? "Đang xác nhận..." : "Xác Nhận OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setError(null);
                    }}
                    className="w-full text-center py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: New Password */}
            {step === "password" && (
              <motion.form
                key="password"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8"
                onSubmit={handleResetPassword}
              >
                <div className="space-y-6">
                  <div className="group">
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 group-focus-within:text-rose-500 transition-colors"
                    >
                      Mật khẩu mới
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="block w-full px-0 py-3 border-b-2 border-neutral-800 bg-transparent text-white placeholder-neutral-700 focus:border-rose-600 focus:outline-none transition-colors text-lg"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="group">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 group-focus-within:text-rose-500 transition-colors"
                    >
                      Nhập lại mật khẩu
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="block w-full px-0 py-3 border-b-2 border-neutral-800 bg-transparent text-white placeholder-neutral-700 focus:border-rose-600 focus:outline-none transition-colors text-lg"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
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

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 text-sm bg-emerald-500/5 border-l-2 border-emerald-500 py-3 px-4"
                  >
                    {success}
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
                    {isLoading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="text-center pt-4">
            <Link
              to="/login"
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
              Quay lại đăng nhập
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;

