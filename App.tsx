import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Home from "./pages/Home";
import ComicDetail from "./pages/ComicDetail";
import ChapterViewer from "./pages/ChapterViewer";
import Search from "./pages/Search";
import CategoryList from "./pages/CategoryList";
import CategoryDetail from "./pages/CategoryDetail";
import ComicList from "./pages/ComicList";
import History from "./pages/History";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Favorites from "./pages/Favorites";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { Analytics } from "@vercel/analytics/react";
import { PageTransition } from "./components/PageTransition";
import { useEffect, useState } from "react";
import RequireAuth from "./routes/RequireAuth";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { persistAuthSession, clearAuthSession } from "./services/authService";

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Check for auth token in URL (Google Login Redirect)
  useEffect(() => {
    const url = new URL(window.location.href);
    const accessToken =
      url.searchParams.get("accessToken") || url.searchParams.get("token");
    const refreshToken = url.searchParams.get("refreshToken");
    const userStr = url.searchParams.get("user");
    const error = url.searchParams.get("error");

    if (error) {
      alert("Đăng nhập thất bại: " + error);
      navigate("/login", { replace: true });
      return;
    }

    if (!accessToken || !refreshToken || isProcessingToken) {
      return;
    }

    setIsProcessingToken(true);
    let resolvedUser: any = null;

    if (userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        // Đảm bảo fullname được set đúng cách
        resolvedUser = {
          ...user,
          fullname:
            user.fullname ||
            user.name ||
            user.displayName ||
            user.given_name ||
            (user.email && user.email.split("@")[0]) ||
            "User",
        };
      } catch (e) {
        console.error("Failed to parse user from URL", e);
      }
    } else {
      try {
        const base64Url = accessToken.split(".")[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            window
              .atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          const decoded = JSON.parse(jsonPayload);
          if (decoded) {
            resolvedUser = {
              ...decoded,
              fullname:
                decoded.fullname ||
                decoded.name ||
                decoded.displayName ||
                decoded.given_name ||
                (decoded.email && decoded.email.split("@")[0]) ||
                "User",
            };
          }
        }
      } catch (e) {
        console.warn("Failed to decode token", e);
      }
    }

    persistAuthSession({
      user: resolvedUser || undefined,
      accessToken,
      refreshToken,
    });

    const cleanUrl = window.location.protocol + "//" + window.location.host;
    window.history.replaceState({}, document.title, cleanUrl);

    navigate("/", { replace: true });
    setIsProcessingToken(false);
  }, [navigate, isProcessingToken]);

  // Lắng nghe sự kiện hết hạn phiên đăng nhập từ authService
  useEffect(() => {
    const handleExpired = () => {
      setIsSessionExpired(true);
    };
    window.addEventListener("auth:sessionExpired", handleExpired);
    return () =>
      window.removeEventListener("auth:sessionExpired", handleExpired);
  }, []);

  // Hide header on reading page for immersion
  const isReading = location.pathname.startsWith("/chapter/");

  // Show loading if processing token to avoid UI flicker or hang
  if (isProcessingToken) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        Đang xử lý đăng nhập...
      </div>
    );
  }

  return (
    <>
      {/* Session expired modal */}
      {isSessionExpired && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-neutral-900 border border-neutral-700 max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">
              Phiên đăng nhập đã hết hạn
            </h2>
            <p className="text-sm text-neutral-300 mb-6">
              Vì lý do bảo mật, bạn cần đăng nhập lại để tiếp tục sử dụng đầy đủ
              tính năng của TruyenReader.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-300 hover:text-white"
                onClick={() => setIsSessionExpired(false)}
              >
                Để sau
              </button>
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wide bg-rose-600 hover:bg-rose-700 text-white rounded-none"
                onClick={() => {
                  clearAuthSession();
                  setIsSessionExpired(false);
                  navigate("/login");
                }}
              >
                Đăng nhập lại
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col">
        {!isReading && <Header />}
        <main className="flex-grow">{children}</main>
        {!isReading && (
          <footer className="bg-neutral-950 border-t border-neutral-800 py-8 text-center text-neutral-500 text-sm">
            <p>
              © {new Date().getFullYear()} TruyenReader. Designed for manga
              lovers.
            </p>
          </footer>
        )}
      </div>
    </>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  // Smart key strategy:
  // - For normal pages: use pathname to trigger transitions
  // - For chapter viewer: use a static key so switching chapters
  //   doesn't trigger a full component remount (preserving the UI state)
  const routeKey = location.pathname.startsWith("/chapter/")
    ? "chapter-viewer"
    : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <div key={routeKey}>
        <Routes location={location}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/search"
            element={
              <PageTransition>
                <Search />
              </PageTransition>
            }
          />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <PageTransition>
                  <History />
                </PageTransition>
              </RequireAuth>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            }
          />
          <Route
            path="/favorites"
            element={
              <RequireAuth>
                <PageTransition>
                  <Favorites />
                </PageTransition>
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </RequireAuth>
            }
          />
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <PageTransition>
                  <Chat />
                </PageTransition>
              </RequireAuth>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <RequireAuth>
                <PageTransition>
                  <UserProfile />
                </PageTransition>
              </RequireAuth>
            }
          />
          <Route
            path="/categories"
            element={
              <PageTransition>
                <CategoryList />
              </PageTransition>
            }
          />
          <Route
            path="/category/:slug"
            element={
              <PageTransition>
                <CategoryDetail />
              </PageTransition>
            }
          />
          <Route
            path="/list/:slug"
            element={
              <PageTransition>
                <ComicList />
              </PageTransition>
            }
          />
          <Route
            path="/comic/:slug"
            element={
              <PageTransition>
                <ComicDetail />
              </PageTransition>
            }
          />
          <Route
            path="/chapter/:slug/:apiUrl"
            element={
              // Remove PageTransition here to disable animation for chapter viewer
              <ChapterViewer />
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <AnimatedRoutes />
      </Layout>
      <PWAInstallPrompt />
      <Analytics />
    </Router>
  );
};

export default App;
