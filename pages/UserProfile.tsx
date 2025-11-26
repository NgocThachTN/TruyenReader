import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { getUserProfileById } from "../services/be";
import { ProfileResponse, ReadingHistoryItem } from "../types/profile";

const buildAvatarSrc = (avatar?: string, version?: number) => {
  if (!avatar) return "";
  const separator = avatar.includes("?") ? "&" : "?";
  return version ? `${avatar}${separator}v=${version}` : avatar;
};

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const numericId = Number(userId);
      if (Number.isNaN(numericId)) {
        throw new Error("ID người dùng không hợp lệ");
      }
      const data = await getUserProfileById(numericId);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin hồ sơ người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const displayName = useMemo(() => {
    if (profile?.user?.fullname?.trim()) return profile.user.fullname;
    if (profile?.user?.email) {
      return profile.user.email.split("@")[0];
    }
    return "User";
  }, [profile?.user?.fullname, profile?.user?.email]);

  const avatarFallback = displayName.charAt(0).toUpperCase();

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-center px-6 text-white">
        <p className="text-neutral-400">{error || "Không tìm thấy hồ sơ"}</p>
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
            {profile.user.avatar ? (
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
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                Hồ sơ người dùng
              </p>
              <h1 className="text-3xl md:text-4xl font-black">{displayName}</h1>
              <p className="text-neutral-400">{profile.user.email}</p>
              <p className="mt-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${
                    profile.isOnline
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      profile.isOnline ? "bg-emerald-400" : "bg-neutral-500"
                    }`}
                  ></span>
                  {profile.isOnline ? "Đang online" : "Offline"}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800">
                <p className="text-neutral-500 text-xs uppercase tracking-widest">
                  Truyện yêu thích
                </p>
                <p className="text-3xl font-black">
                  {profile.favorites?.length || 0}
                </p>
              </div>
              <div className="p-4 bg-neutral-950 border border-neutral-800">
                <p className="text-neutral-500 text-xs uppercase tracking-widest">
                  Lịch sử đọc
                </p>
                <p className="text-3xl font-black">
                  {profile.readingHistory?.length || 0}
                </p>
              </div>
              <div className="p-4 bg-neutral-950 border border-neutral-800">
                <p className="text-neutral-500 text-xs uppercase tracking-widest">
                  Vai trò
                </p>
                <p className="text-2xl font-bold capitalize">
                  {profile.user.role || "user"}
                </p>
              </div>
            </div>
            <div className="text-sm text-neutral-500 space-y-1">
              <div>
                Tham gia ngày{" "}
                <span className="text-neutral-300 font-medium">
                  {profile.user.createdAt
                    ? new Date(profile.user.createdAt).toLocaleDateString(
                        "vi-VN"
                      )
                    : "-"}
                </span>
              </div>
              <div>
                Hoạt động gần nhất{" "}
                <span className="text-neutral-300 font-medium">
                  {profile.user.lastSeenAt
                    ? new Date(profile.user.lastSeenAt).toLocaleString("vi-VN")
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Truyện yêu thích</h2>
          </div>
          {profile.favorites && profile.favorites.length > 0 ? (
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
              Người dùng này chưa có truyện yêu thích nào.
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Lịch sử đọc mới nhất</h2>
          </div>
          {profile.readingHistory && profile.readingHistory.length > 0 ? (
            <div className="space-y-4">
              {profile.readingHistory.slice(0, 6).map((history) => {
                const { chapter } = parseChapter(history);
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
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-neutral-900 border border-dashed border-neutral-800 p-6 text-neutral-500 text-center">
              Người dùng này chưa có lịch sử đọc từ máy chủ.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
