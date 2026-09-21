import { useState } from 'react';
import { BookOpen, BookMarked, Search as SearchIcon, Home } from 'lucide-react';
import HomePage from './pages/HomePage';
import SurahPage from './pages/SurahPage';
import HadithPage from './pages/HadithPage';
import BookmarksPage from './pages/BookmarksPage';
import SearchPage from './pages/SearchPage';
import './App.css';

type Page = 'home' | 'surah' | 'hadith' | 'bookmarks' | 'search';

interface PageState {
  page: Page;
  surahId?: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageState>({ page: 'home' });
  const [isDark, setIsDark] = useState(false);

  const navigateTo = (page: Page, surahId?: number) => {
    setCurrentPage({ page, surahId });
  };

  const renderPage = () => {
    switch (currentPage.page) {
      case 'home':
        return <HomePage onSelectSurah={(id) => navigateTo('surah', id)} />;
      case 'surah':
        return <SurahPage surahId={currentPage.surahId!} onBack={() => navigateTo('home')} />;
      case 'hadith':
        return <HadithPage onBack={() => navigateTo('home')} />;
      case 'bookmarks':
        return <BookmarksPage onSelectSurah={(id) => navigateTo('surah', id)} onBack={() => navigateTo('home')} />;
      case 'search':
        return <SearchPage onSelectSurah={(id) => navigateTo('surah', id)} onBack={() => navigateTo('home')} />;
      default:
        return <HomePage onSelectSurah={(id) => navigateTo('surah', id)} />;
    }
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <BookOpen size={28} />
            <span className="app-title">Mushaf ID</span>
          </div>

          <div className="navbar-actions">
            <button onClick={() => navigateTo('search')} className="nav-btn" title="Search">
              <SearchIcon size={20} />
            </button>
            <button onClick={() => navigateTo('bookmarks')} className="nav-btn" title="Bookmarks">
              <BookMarked size={20} />
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="nav-btn theme-toggle"
              title="Toggle Theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>🕌 Mushaf ID - Quran Web Reader</p>
          <div className="footer-nav">
            <button onClick={() => navigateTo('home')} className="footer-btn">
              <Home size={16} /> Home
            </button>
            <button onClick={() => navigateTo('hadith')} className="footer-btn">
              <BookOpen size={16} /> Hadith
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
