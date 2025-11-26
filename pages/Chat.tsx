import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Spinner from "../components/Spinner";
import {
  ConversationItem,
  ConversationsResponse,
  OnlineUserItem,
  OnlineUsersResponse,
  API_BASE_URL,
  getConversations,
  getChatMessagesWithUser,
  getOnlineUsers,
  sendChatMessage,
  markChatMessagesAsRead,
} from "../services/be";

interface ChatMessage {
  messageId: number;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt: string;
}

const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const activeUserIdRef = useRef<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const initialUserIdFromQuery = searchParams.get("userId");
  const initialUserNameFromQuery = searchParams.get("fullname") || "";
  const initialUserId = initialUserIdFromQuery
    ? Number(initialUserIdFromQuery)
    : null;
  const [hasAppliedInitialUser, setHasAppliedInitialUser] = useState(false);

  const currentUserInfo = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const userId =
        typeof parsed.userId === "number"
          ? parsed.userId
          : typeof parsed.id === "number"
          ? parsed.id
          : null;
      return {
        userId,
        fullname: parsed.fullname || parsed.name || "",
        avatar: parsed.avatar || "",
      } as {
        userId: number | null;
        fullname: string;
        avatar?: string;
      };
    } catch {
      return null;
    }
  }, []);

  const SOCKET_URL = useMemo(() => {
    try {
      const url = new URL(API_BASE_URL);
      // API_BASE_URL ví dụ: https://domain.com/api -> bỏ /api
      return `${url.protocol}//${url.host}`;
    } catch {
      return API_BASE_URL.replace("/api", "");
    }
  }, []);

  // Luôn lưu lại userId đang mở chat để dùng trong socket listener
  useEffect(() => {
    activeUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  // Đảm bảo khi vào trang chat luôn scroll lên đầu (toàn trang)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
      window.cancelAnimationFrame(id);
    };
  }, []);

  // Khi đã load xong tin nhắn cho cuộc trò chuyện hiện tại, cuộn khung chat xuống cuối
  useEffect(() => {
    if (!selectedUserId || loadingMessages || messages.length === 0) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    const timeoutId = window.setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [selectedUserId, loadingMessages, messages.length]);

  const currentUserId = currentUserInfo?.userId ?? null;

  const selectedConversationUser = useMemo(
    () =>
      conversations.find((c) => c.user.userId === selectedUserId)?.user || null,
    [conversations, selectedUserId]
  );

  const currentConversation = useMemo(
    () => conversations.find((c) => c.user.userId === selectedUserId) || null,
    [conversations, selectedUserId]
  );

  const isSelectedUserOnline = useMemo(
    () => !!onlineUsers.find((u) => u.userId === selectedUserId),
    [onlineUsers, selectedUserId]
  );

  // Sắp xếp cuộc trò chuyện: cuộc có tin nhắn mới nhất lên trên
  const sortConversationsByLatestMessage = (
    list: ConversationItem[]
  ): ConversationItem[] => {
    return [...list].sort((a, b) => {
      const aTime = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });
  };

  const markConversationAsReadLocally = (otherUserId: number) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.user.userId === otherUserId
          ? {
              ...c,
              unreadCount: 0,
              // Chỉ set đã đọc cho tin nhắn mà mình là người nhận (receiver)
              lastMessage:
                c.lastMessage && c.lastMessage.receiverId === currentUserId
                  ? {
                      ...c.lastMessage,
                      isRead: true,
                    }
                  : c.lastMessage,
            }
          : c
      )
    );
  };

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: ConversationsResponse = await getConversations();
      const list = sortConversationsByLatestMessage(data.conversations || []);
      setConversations(list);

      // Ưu tiên userId từ query ?userId=...
      if (!hasAppliedInitialUser && initialUserId) {
        const convUser =
          list.find((c) => c.user.userId === initialUserId)?.user || null;
        setSelectedUserId(initialUserId);
        setSelectedUserName(
          convUser?.fullname || initialUserNameFromQuery || ""
        );
        await loadMessages(initialUserId);
        try {
          await markChatMessagesAsRead(initialUserId);
          markConversationAsReadLocally(initialUserId);
        } catch (e) {
          console.warn("Failed to mark messages as read", e);
        }
        setHasAppliedInitialUser(true);
      } else if (!selectedUserId && list.length > 0) {
        const firstUser = list[0].user;
        setSelectedUserId(firstUser.userId);
        setSelectedUserName(firstUser.fullname);
        await loadMessages(firstUser.userId);
        try {
          await markChatMessagesAsRead(firstUser.userId);
          markConversationAsReadLocally(firstUser.userId);
        } catch (e) {
          console.warn("Failed to mark messages as read", e);
        }
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách cuộc trò chuyện");
    } finally {
      setLoading(false);
    }
  };

  // Chỉ làm mới danh sách cuộc trò chuyện (không đổi selectedUser / không loadMessages)
  const refreshConversationsSilently = async () => {
    try {
      const data: ConversationsResponse = await getConversations();
      const list = sortConversationsByLatestMessage(data.conversations || []);
      setConversations(list);
    } catch (err) {
      console.warn("Failed to refresh conversations", err);
    }
  };

  const loadMessages = async (userId: number) => {
    setLoadingMessages(true);
    try {
      const data = await getChatMessagesWithUser(userId);
      const raw =
        data.messages ||
        data.data?.messages ||
        data.conversation?.messages ||
        data.items ||
        data;
      const arr = Array.isArray(raw) ? raw : [];
      const messagesData: ChatMessage[] = arr.map((m: any, index: number) => ({
        messageId: m.messageId ?? m.id ?? index,
        senderId: m.senderId ?? m.fromUserId ?? m.sender?.userId ?? 0,
        receiverId: m.receiverId ?? m.toUserId ?? m.receiver?.userId ?? 0,
        message: m.message ?? m.content ?? "",
        createdAt: m.createdAt ?? m.sentAt ?? new Date().toISOString(),
      }));
      const sortedMessages = messagesData.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
      // Sau khi load xong tin nhắn cho user này, cuộn khung chat xuống cuối
      const container = messagesContainerRef.current;
      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 0);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải tin nhắn");
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadOnlineUsers = async () => {
    setLoadingOnline(true);
    try {
      const data: OnlineUsersResponse = await getOnlineUsers();
      setOnlineUsers(data.onlineUsers || []);
    } catch {
      // không cần hiển thị lỗi lớn, chỉ log
      console.warn("Failed to load online users");
    } finally {
      setLoadingOnline(false);
    }
  };

  useEffect(() => {
    // Kết nối Socket.IO với JWT token
    const token = localStorage.getItem("token");
    if (token) {
      const socket = io(SOCKET_URL, {
        auth: { token },
      });
      socketRef.current = socket;

      socket.on("connect_error", (err) => {
        console.warn("Socket connect error", err);
      });

      socket.on("newMessage", (msg: any) => {
        const mapped: ChatMessage = {
          messageId: msg.messageId ?? msg.id ?? Date.now(),
          senderId: msg.senderId ?? msg.fromUserId ?? msg.sender?.userId ?? 0,
          receiverId:
            msg.receiverId ?? msg.toUserId ?? msg.receiver?.userId ?? 0,
          message: msg.message ?? msg.content ?? "",
          createdAt: msg.createdAt ?? msg.sentAt ?? new Date().toISOString(),
        };

        // Nếu đang mở chat với user này thì cập nhật UI ngay
        const activeId = activeUserIdRef.current;
        setMessages((prev) => {
          // Nếu messageId đã tồn tại trong state thì bỏ qua để tránh bị trùng
          if (
            mapped.messageId &&
            prev.some((m) => m.messageId === mapped.messageId)
          ) {
            return prev;
          }

          // Nếu là tin mình vừa gửi thì đã có bản optimistic, không cần thêm lần nữa
          // Nếu là tin mình vừa gửi thì UI đã có bản optimistic, không cần thêm lần nữa
          if (mapped.senderId === currentUserId) {
            return prev;
          }

          if (
            !activeId ||
            (mapped.senderId !== activeId && mapped.receiverId !== activeId)
          ) {
            return prev;
          }
          const next = [...prev, mapped];
          const container = messagesContainerRef.current;
          if (container) {
            setTimeout(() => {
              container.scrollTop = container.scrollHeight;
            }, 0);
          }
          return next;
        });

        // Cập nhật sơ bộ conversations (unread + lastMessage)
        setConversations((prev) => {
          const otherUserId =
            mapped.senderId === currentUserId
              ? mapped.receiverId
              : mapped.senderId;
          const existing = prev.find((c) => c.user.userId === otherUserId);
          if (!existing) {
            return prev;
          }
          const updated = prev.map((c) =>
            c.user.userId === otherUserId
              ? {
                  ...c,
                  lastMessage: {
                    messageId: mapped.messageId,
                    senderId: mapped.senderId,
                    receiverId: mapped.receiverId,
                    message: mapped.message,
                    isRead:
                      selectedUserId === otherUserId &&
                      mapped.receiverId === currentUserId
                        ? true
                        : c.lastMessage?.isRead ?? false,
                    createdAt: mapped.createdAt,
                    updatedAt: mapped.createdAt,
                  },
                  unreadCount:
                    selectedUserId === otherUserId ||
                    mapped.senderId === currentUserId
                      ? 0
                      : (c.unreadCount || 0) + 1,
                }
              : c
          );
          return sortConversationsByLatestMessage(updated);
        });
      });
    }

    loadConversations();
    loadOnlineUsers();

    const intervalId = setInterval(() => {
      loadOnlineUsers();
    }, 15000);

    return () => {
      clearInterval(intervalId);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi đang mở một cuộc trò chuyện, tự động refresh conversations định kỳ
  // để cập nhật trạng thái "đã đọc" mà không cần reload trang
  useEffect(() => {
    if (!selectedUserId) return;
    const intervalId = window.setInterval(() => {
      refreshConversationsSilently();
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [selectedUserId]);

  const openConversation = async (userId: number, fullname: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(fullname);
    if (socketRef.current) {
      socketRef.current.emit("joinChat", userId);
    }
    await loadMessages(userId);
    try {
      await markChatMessagesAsRead(userId);
      markConversationAsReadLocally(userId);
    } catch (e) {
      console.warn("Failed to mark messages as read", e);
    }
  };

  const handleSelectConversation = (conv: ConversationItem) => {
    openConversation(conv.user.userId, conv.user.fullname);
  };

  const handleSelectOnlineUser = (user: OnlineUserItem) => {
    openConversation(user.userId, user.fullname);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUserId) return;

    try {
      setSending(true);
      const text = messageInput.trim();
      setMessageInput("");

      // Nếu socket đang kết nối, gửi qua socket để realtime
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("sendMessage", {
          receiverId: selectedUserId,
          message: text,
        });
        // Optimistic update UI cho phía mình, server sẽ gửi "newMessage"
        // nhưng trong listener đã chặn không append lại lần nữa cho sender
        const optimistic: ChatMessage = {
          messageId: Date.now(),
          senderId: currentUserId || 0,
          receiverId: selectedUserId,
          message: text,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => {
          const next = [...prev, optimistic];
          const container = messagesContainerRef.current;
          if (container) {
            setTimeout(() => {
              container.scrollTop = container.scrollHeight;
            }, 0);
          }
          return next;
        });
      } else {
        // Fallback REST nếu socket không kết nối
        await sendChatMessage(selectedUserId, text);
        await loadMessages(selectedUserId);
        await loadConversations();
        const container = messagesContainerRef.current;
        if (container) {
          setTimeout(() => {
            container.scrollTop = container.scrollHeight;
          }, 0);
        }
      }
    } catch (err: any) {
      alert(err.message || "Gửi tin nhắn thất bại");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-center px-6 text-white">
        <p className="text-neutral-400">{error}</p>
        <button
          onClick={loadConversations}
          className="px-6 py-2 bg-rose-600 text-white font-bold uppercase tracking-wider"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="container max-w-7xl mx-auto px-3 lg:px-4 py-6 lg:py-8 flex flex-col lg:flex-row gap-3 lg:gap-6">
        {/* Left: Conversations */}
        <div className="flex flex-col w-full lg:w-1/5 bg-neutral-900 border border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800 text-sm font-bold uppercase tracking-widest text-neutral-400">
            Cuộc trò chuyện
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="px-4 py-6 text-xs text-neutral-500">
                Chưa có cuộc trò chuyện nào.
              </div>
            ) : (
              conversations.map((conv) => {
                const isOnline = onlineUsers.some(
                  (u) => u.userId === conv.user.userId
                );
                return (
                  <button
                    key={conv.user.userId}
                    type="button"
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-neutral-800 hover:bg-neutral-800/60 ${
                      selectedUserId === conv.user.userId
                        ? "bg-neutral-800"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold">
                        {conv.user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={conv.user.avatar}
                            alt={conv.user.fullname}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          conv.user.fullname.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-neutral-900 ${
                          isOnline ? "bg-emerald-400" : "bg-neutral-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold truncate">
                          {conv.user.fullname}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold px-1.5 py-0.5">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-neutral-500 truncate">
                          {conv.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center: Chat box */}
        <div className="flex-1 flex flex-col bg-neutral-900 border border-neutral-800 h-[calc(100vh-160px)]">
          <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            {selectedUserId && selectedConversationUser ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold">
                    {selectedConversationUser.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedConversationUser.avatar}
                        alt={selectedConversationUser.fullname}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      selectedConversationUser.fullname.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-neutral-900 ${
                      isSelectedUserOnline ? "bg-emerald-400" : "bg-neutral-500"
                    }`}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">
                    {selectedConversationUser.fullname}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {isSelectedUserOnline ? "Đang hoạt động" : "Ngoại tuyến"}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold">
                  {selectedUserName || "Chọn một cuộc trò chuyện"}
                </p>
              </div>
            )}
          </div>
          <div
            ref={messagesContainerRef}
            className="flex-1 max-h-[calc(100vh-220px)] overflow-y-auto px-2 md:px-4 py-4 space-y-4"
          >
            {!selectedUserId ? (
              <p className="text-sm text-neutral-500">
                Hãy chọn một người để bắt đầu trò chuyện.
              </p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-neutral-500">
                {loadingMessages
                  ? "Đang tải tin nhắn..."
                  : "Chưa có tin nhắn nào. Hãy là người nhắn trước!"}
              </p>
            ) : (
              messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUserId;
                const avatarSource = selectedConversationUser?.avatar;
                const displayName =
                  selectedConversationUser?.fullname || selectedUserName;
                const isLastMessage = index === messages.length - 1;
                const showReadReceipt =
                  isOwn &&
                  isLastMessage &&
                  !!currentConversation?.lastMessage &&
                  currentConversation.lastMessage.senderId === currentUserId &&
                  currentConversation.lastMessage.isRead;

                return (
                  <div
                    key={msg.messageId}
                    className={`flex w-full items-end gap-1 md:gap-2 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwn && (
                      <div className="relative w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {avatarSource ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarSource}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          (displayName || "?").charAt(0).toUpperCase()
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-neutral-900 ${
                            isSelectedUserOnline
                              ? "bg-emerald-400"
                              : "bg-neutral-600"
                          }`}
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[96%] md:max-w-[92%] lg:max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isOwn
                          ? "bg-rose-600 text-white ml-auto rounded-br-sm"
                          : "bg-neutral-800 text-neutral-100 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-[11px] text-neutral-300 text-right flex-1">
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {showReadReceipt && (
                          <span className="ml-2 text-[10px] text-emerald-400 font-medium">
                            Đã đọc
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form
            onSubmit={handleSendMessage}
            className="border-t border-neutral-800 px-4 py-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none"
            />
            <button
              type="submit"
              disabled={!selectedUserId || !messageInput.trim() || sending}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-bold uppercase tracking-wider"
            >
              {sending ? "Đang gửi..." : "Gửi"}
            </button>
          </form>
        </div>

        {/* Right: Online users */}
        <div className="hidden lg:flex flex-col w-1/5 bg-neutral-900 border border-neutral-800">
          <div className="px-4 py-3 border-b border-neutral-800 text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center justify-between">
            <span>Đang online</span>
            {loadingOnline && (
              <span className="text-[10px] text-neutral-500">
                Đang cập nhật...
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {onlineUsers.length === 0 ? (
              <div className="px-4 py-6 text-xs text-neutral-500">
                Hiện không có ai online.
              </div>
            ) : (
              onlineUsers.map((user) => (
                <button
                  key={user.userId}
                  type="button"
                  onClick={() => handleSelectOnlineUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-neutral-800 hover:bg-neutral-800/60"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar}
                          alt={user.fullname}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        user.fullname.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-neutral-900 bg-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user.fullname}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
