import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { changePassword } from "../services/be";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    key: number;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const styleId = "change-password-modal-anim";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes modalPop {
          0% { opacity: 0; transform: translateY(12px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ripplePulse {
          0% { transform: scale(0); opacity: 0.45; }
          100% { transform: scale(6); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen || !isMounted) return null;

  const resetState = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsVisible(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      resetState();
      onClose();
    }, 200);
  };

  const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setRipple({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      key: Date.now(),
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (oldPassword === newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setSuccess("Đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể đổi mật khẩu lúc này"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-200 ${
        isVisible ? "bg-black/80 opacity-100" : "bg-black/80 opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-md border border-neutral-800 bg-neutral-950 shadow-[0_16px_40px_rgba(0,0,0,0.65)] transition-all duration-200 ${
          isVisible ? "animate-[modalPop_0.25s_ease]" : "scale-95 opacity-0"
        }`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-rose-600 via-rose-500 to-orange-400" />
        <div className="flex items-start justify-between border-b border-neutral-800 px-5 py-4">
          <div>
            <p className="text-[12px] uppercase tracking-[0.25em] text-rose-400 font-semibold">
              Bảo mật
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Đổi mật khẩu
            </h3>
            <p className="text-sm text-neutral-500">
              Vui lòng xác thực mật khẩu hiện tại để tiếp tục
            </p>
          </div>
            <button
            onClick={handleClose}
            className="text-neutral-500 hover:text-white transition-colors text-lg"
            aria-label="Đóng popup đổi mật khẩu"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-rose-500 focus:outline-none transition-colors placeholder:text-neutral-600"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-rose-500 focus:outline-none transition-colors placeholder:text-neutral-600"
              placeholder="Tối thiểu 8 ký tự"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-rose-500 focus:outline-none transition-colors placeholder:text-neutral-600"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {error && (
            <p className="border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </p>
          )}
          {success && (
            <p className="border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 text-xs">
            <p className="text-neutral-500 pr-4">
              Lưu ý: Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              onMouseDown={handleRipple}
              className="relative overflow-hidden inline-flex items-center gap-2 bg-rose-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-rose-500 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:translate-y-0 disabled:scale-100"
            >
              {ripple && (
                <span
                  key={ripple.key}
                  className="pointer-events-none absolute block h-2 w-2 rounded-full bg-white/30"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    transform: "translate(-50%, -50%)",
                    animation: "ripplePulse 0.5s ease-out",
                  }}
                ></span>
              )}
              {isSubmitting && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ChangePasswordModal;

