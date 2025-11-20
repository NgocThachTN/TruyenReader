import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
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
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { Analytics } from "@vercel/analytics/react";
import { PageTransition } from "./components/PageTransition";

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  // Hide header on reading page for immersion
  const isReading = location.pathname.startsWith("/chapter/");

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
