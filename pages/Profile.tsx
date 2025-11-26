import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import { getProfile, updateProfile, uploadAvatar } from "../services/be";
import {
  ProfileResponse,
  ProfileUpdatePayload,
  ReadingHistoryItem,
} from "../types/profile";

const buildAvatarSrc = (avatar?: string, version?: number) => {
  if (!avatar) return "";
  const separator = avatar.includes("?") ? "&" : "?";
  return version ? `${avatar}${separator}v=${version}` : avatar;
};

const applyAvatarVersion = (
  data: ProfileResponse,
  avatarVersion?: number
): ProfileResponse => {
  if (avatarVersion === undefined) {
    return data;
  }
  return {
    ...data,
    user: {
      ...data.user,
      avatarVersion,
    },
  };
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [formData, setFormData] = useState<ProfileUpdatePayload>({
    fullname: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const applyProfileData = (
    data: ProfileResponse,
    avatarVersion?: number
  ): ProfileResponse["user"] => {
    const versionedData = applyAvatarVersion(data, avatarVersion);
    setProfile(versionedData);
    setFormData({
      fullname: versionedData.user.fullname || "",
      email: versionedData.user.email || "",
    });
    return versionedData.user;
  };

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      let avatarVersion: number | undefined;
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          avatarVersion = parsed.avatarVersion;
        } catch (err) {
          console.warn("Failed to parse stored user", err);
        }
      }
      applyProfileData(data, avatarVersion);
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    loadProfile();
  }, []);

  const displayName = useMemo(() => {
    if (formData.fullname?.trim()) return formData.fullname;
    if (profile?.user?.email) {
      return profile.user.email.split("@")[0];
    }
    return "User";
  }, [formData.fullname, profile?.user?.email]);

  const avatarFallback = displayName.charAt(0).toUpperCase();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(null);
    if (error) setError(null);
  };

  const syncLocalUser = (partialUser: Partial<ProfileResponse["user"]>) => {
    try {
      const stored = localStorage.getItem("user");
      const current = stored ? JSON.parse(stored) : {};
      const merged = { ...current, ...partialUser };
      localStorage.setItem("user", JSON.stringify(merged));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("user:updated"));
    } catch (err) {
      console.warn("Failed to sync local user", err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await updateProfile(formData);
      const currentProfile = profile || {
        user: {
          ...response.user,
        },
        favorites: [],
        readingHistory: [],
      };
      const updatedUser = {
        ...currentProfile.user,
        ...response.user,
        avatarVersion: currentProfile.user.avatarVersion,
      };
      setProfile({ ...currentProfile, user: updatedUser });
      setFormData({
        fullname: updatedUser.fullname || "",
        email: updatedUser.email || "",
      });
      syncLocalUser(updatedUser);
      setSuccess("Thông tin hồ sơ đã được cập nhật!");
    } catch (err: any) {
      setError(err.message || "Cập nhật hồ sơ thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      await uploadAvatar(file);
      const refreshedProfile = await getProfile();
      const updatedUser = applyProfileData(refreshedProfile, Date.now());
      syncLocalUser(updatedUser);
      setSuccess("Ảnh đại diện đã được cập nhật!");
    } catch (err: any) {
      setError(err.message || "Tải ảnh đại diện thất bại");
    } finally {
      e.target.value = "";
      setUploading(false);
    }
  };

  const parseChapter = (historyItem: ReadingHistoryItem) => {
    if (!historyItem.currentChapter) return { chapter: "N/A", chapterUrl: "" };
    const [chapter, apiUrl] = historyItem.currentChapter.split("::");
    return {
      chapter: chapter || "N/A",
      chapterUrl: apiUrl || "",
    };
  };

  if (loading) {
    return <Spinner />;
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-neutral-400">{error}</p>
        <button
          onClick={loadProfile}
          className="px-6 py-2 bg-rose-600 text-white font-bold uppercase tracking-wider"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pb-12 text-white">
      <div className="container mx-auto px-4 py-10 space-y-10">
        <section className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative">
            {profile?.user?.avatar ? (
              <img
                src={buildAvatarSrc(
                  profile.user.avatar,
                  profile.user.avatarVersion
                )}
                alt={displayName}
                className="w-36 h-36 md:w-40 md:h-40 rounded-full object-cover border-4 border-neutral-800"
              />
            ) : (
              <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-rose-600 flex items-center justify-center text-4xl font-black border-4 border-neutral-800">
                {avatarFallback}
              </div>
            )}
            <label className="absolute bottom-2 right-2 bg-neutral-900 border border-neutral-700 rounded-full p-3 cursor-pointer hover:bg-neutral-800 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
              {uploading ? (
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
              ) : (
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              )}
            </label>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                Hồ sơ của bạn
              </p>
              <h1 className="text-3xl md:text-4xl font-black">{displayName}</h1>
              <p className="text-neutral-400">{profile?.user?.email}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800">
                <p className="text-neutral-500 text-xs uppercase tracking-widest">
                  Truyện yêu thích
                </p>
                <p className="text-3xl font-black">
                  {profile?.favorites?.length || 0}
                </p>
              </div>
              <div className="p-4 bg-neutral-950 border border-neutral-800">
                <p className="text-neutral-500 text-xs uppercase tracking-widest">
                  Lịch sử đọc
                </p>
                <p className="text-3xl font-black">
                  {profile?.readingHistory?.length || 0}
                </p>
              </div>
              <div className="p-4 bg-neutral-950 border border-neutral-800">
                <p className="text-neutral-500 text-xs uppercase tracking-widest">
                  Vai trò
                </p>
                <p className="text-2xl font-bold capitalize">
                  {profile?.user?.role || "user"}
                </p>
              </div>
            </div>
            <div className="text-sm text-neutral-500 space-y-1">
              <div>
                Tham gia ngày{" "}
                <span className="text-neutral-300 font-medium">
                  {profile?.user?.createdAt
                    ? new Date(profile.user.createdAt).toLocaleDateString(
                        "vi-VN"
                      )
                    : "-"}
                </span>
              </div>
              <div>
                Hoạt động gần nhất{" "}
                <span className="text-neutral-300 font-medium">
                  {profile?.user?.lastSeenAt
                    ? new Date(profile.user.lastSeenAt).toLocaleString("vi-VN")
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {(error || success) && (
          <div
            className={`p-4 border ${
              error
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {error || success}
          </div>
        )}

        <section className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
              <p className="text-sm text-neutral-500">
                Cập nhật họ tên và email để đồng bộ tài khoản
              </p>
            </div>
            <button
              onClick={() => setShowEditForm((prev) => !prev)}
              className="px-4 py-2 border border-neutral-700 text-sm font-bold uppercase tracking-widest hover:border-white transition-colors"
            >
              {showEditForm ? "Đóng" : "Chỉnh sửa"}
            </button>
          </div>
          {showEditForm && (
            <form className="space-y-6" onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fullname"
                    className="block text-sm uppercase tracking-wider text-neutral-500 mb-2"
                  >
                    Họ tên
                  </label>
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none transition-colors"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm uppercase tracking-wider text-neutral-500 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </form>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Truyện yêu thích</h2>
            {profile && profile.favorites.length > 0 && (
              <Link
                to="/favorites"
                className="text-sm text-rose-400 hover:text-rose-300 uppercase tracking-widest"
              >
                Xem tất cả
              </Link>
            )}
          </div>
          {profile && profile.favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.favorites.slice(0, 6).map((favorite) => (
                <Link
                  key={favorite.id}
                  to={`/comic/${favorite.comicSlug}`}
                  className="flex gap-4 bg-neutral-900 border border-neutral-800 p-4 hover:border-rose-600/60 transition-colors"
                >
                  <div className="w-20 h-28 overflow-hidden bg-neutral-800">
                    <img
                      src={
                        favorite.comicThumb.startsWith("http")
                          ? favorite.comicThumb
                          : `https://img.otruyenapi.com/uploads/comics/${favorite.comicThumb}`
                      }
                      alt={favorite.comicName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-100 line-clamp-2 mb-2">
                      {favorite.comicName}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Đã thêm ngày{" "}
                      {new Date(favorite.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900 border border-dashed border-neutral-800 p-6 text-neutral-500 text-center">
              Bạn chưa có truyện yêu thích nào.{" "}
              <Link to="/" className="text-rose-400 hover:text-rose-300">
                Khám phá ngay!
              </Link>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Lịch sử đọc mới nhất</h2>
            {profile && profile.readingHistory.length > 0 && (
              <Link
                to="/history"
                className="text-sm text-rose-400 hover:text-rose-300 uppercase tracking-widest"
              >
                Quản lý lịch sử
              </Link>
            )}
          </div>
          {profile && profile.readingHistory.length > 0 ? (
            <div className="space-y-4">
              {profile.readingHistory.slice(0, 6).map((history) => {
                const { chapter, chapterUrl } = parseChapter(history);
                return (
                  <div
                    key={history.id}
                    className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col sm:flex-row gap-4 sm:items-center"
                  >
                    <div className="flex-1">
                      <Link
                        to={`/comic/${history.comicSlug}`}
                        className="font-bold text-neutral-100 hover:text-rose-400 transition-colors"
                      >
                        {history.comicName}
                      </Link>
                      <p className="text-sm text-neutral-500">
                        Đọc lần cuối:{" "}
                        {new Date(history.lastReadAt).toLocaleString("vi-VN")}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Chapter hiện tại: {chapter}
                      </p>
                    </div>
                    {chapterUrl ? (
                      <Link
                        to={`/chapter/${history.comicSlug}/${encodeURIComponent(
                          chapterUrl
                        )}`}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-center font-bold uppercase tracking-wider text-sm"
                      >
                        Đọc tiếp
                      </Link>
                    ) : (
                      <span className="px-4 py-2 bg-neutral-800 text-neutral-500 text-sm text-center">
                        Chưa có liên kết chương
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-neutral-900 border border-dashed border-neutral-800 p-6 text-neutral-500 text-center">
              Bạn chưa có lịch sử đọc từ máy chủ.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
