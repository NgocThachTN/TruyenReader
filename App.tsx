import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ComicDetail from './pages/ComicDetail';
import ChapterViewer from './pages/ChapterViewer';
import Search from './pages/Search';
import CategoryList from './pages/CategoryList';
import CategoryDetail from './pages/CategoryDetail';
import ComicList from './pages/ComicList';
import { Analytics } from "@vercel/analytics/next"


const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  // Hide header on reading page for immersion
  const isReading = location.pathname.startsWith('/chapter/');

  return (
    <div className="min-h-screen flex flex-col">
      {!isReading && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isReading && (
        <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} OTruyen Reader. Designed for manga lovers.</p>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/category/:slug" element={<CategoryDetail />} />
          <Route path="/list/:slug" element={<ComicList />} />
          <Route path="/comic/:slug" element={<ComicDetail />} />
          <Route path="/chapter/:slug/:apiUrl" element={<ChapterViewer />} />
        </Routes>
      </Layout>
      <Analytics />
    </Router>
  );
};

export default App;