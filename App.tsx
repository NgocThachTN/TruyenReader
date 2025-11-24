import React from "react";
import {
  HashRouter as Router,
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

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessingToken, setIsProcessingToken] = useState(false);

  // Check for auth token in URL (Google Login Redirect)
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const userStr = url.searchParams.get("user");
    const error = url.searchParams.get("error");

    if (error) {
      alert("Đăng nhập thất bại: " + error);
      navigate("/login", { replace: true });
      return;
    }

    if (!token || isProcessingToken) {
      return;
    }

    setIsProcessingToken(true);
    localStorage.setItem("token", token);

    if (userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        // Đảm bảo fullname được set đúng cách
        const userData = {
          ...user,
          fullname:
            user.fullname ||
            user.name ||
            user.displayName ||
            user.given_name ||
            (user.email && user.email.split("@")[0]) ||
            "User",
        };
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (e) {
        console.error("Failed to parse user from URL", e);
      }
    } else {
      try {
        const base64Url = token.split(".")[1];
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
            const userData = {
              ...decoded,
              fullname:
                decoded.fullname ||
                decoded.name ||
                decoded.displayName ||
                decoded.given_name ||
                (decoded.email && decoded.email.split("@")[0]) ||
                "User",
            };
            localStorage.setItem("user", JSON.stringify(userData));
          }
        }
      } catch (e) {
        console.warn("Failed to decode token", e);
      }
    }

    window.dispatchEvent(new Event("storage"));

    const cleanUrl =
      window.location.protocol + "//" + window.location.host + "/#/";
    window.history.replaceState({}, document.title, cleanUrl);

    navigate("/", { replace: true });
    setIsProcessingToken(false);
  }, [navigate, isProcessingToken]);

  // Hide header on reading page for immersion
  const isReading = location.pathname.startsWith("/chapter/");
  
  // Show loading if processing token to avoid UI flicker or hang
  if (isProcessingToken) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Đang xử lý đăng nhập...</div>;
  }

  return (
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
      <Routes location={location} key={routeKey}>
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
            <PageTransition>
              <History />
            </PageTransition>
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
            <PageTransition>
              <Favorites />
            </PageTransition>
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
      </Routes>
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
