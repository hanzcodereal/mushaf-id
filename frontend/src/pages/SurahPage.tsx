import { useState, useEffect } from 'react';
import { ArrowLeft, BookMarked, Copy, Share2 } from 'lucide-react';
import { apiClient, Surah, Ayah, Bookmark } from '../services/api';
import './pages.css';

interface SurahPageProps {
  surahId: number;
  onBack: () => void;
}

export default function SurahPage({ surahId, onBack }: SurahPageProps) {
  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [surahData, ayahsData, bookmarksData] = await Promise.all([
          apiClient.getSurah(surahId),
          apiClient.getAyahs(surahId),
          apiClient.getBookmarks(),
        ]);

        setSurah(surahData);
        setAyahs(ayahsData);

        const bookmarkSet = new Set<string>();
        bookmarksData.forEach((b: Bookmark) => {
          bookmarkSet.add(`${b.surah_id}-${b.verse_id}`);
        });
        setBookmarks(bookmarkSet);
      } catch (err) {
        setError('Failed to load surah. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [surahId]);

  const toggleBookmark = async (verseId: number) => {
    const key = `${surahId}-${verseId}`;

    try {
      if (bookmarks.has(key)) {
        await apiClient.removeBookmark(surahId, verseId);
        const newBookmarks = new Set(bookmarks);
        newBookmarks.delete(key);
        setBookmarks(newBookmarks);
      } else {
        await apiClient.addBookmark(surahId, verseId);
        const newBookmarks = new Set(bookmarks);
        newBookmarks.add(key);
        setBookmarks(newBookmarks);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const copyAyah = (ayah: Ayah) => {
    const text = `${ayah.text_ar}\n\n${ayah.text_id}`;
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const shareAyah = (ayah: Ayah) => {
    if (navigator.share) {
      navigator.share({
        title: `${surah?.name_latin} (${ayah.verse_id}:${surahId})`,
        text: `${ayah.text_ar}\n\n${ayah.text_id}`,
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading surah...</div>;
  }

  if (error) {
    return (
      <div>
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div>
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="error">Surah not found</div>
      </div>
    );
  }

  return (
    <div className="page">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft size={20} /> Back to Surahs
      </button>

      <div className="surah-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{surah.name_latin}</h2>
        <h3 style={{ fontSize: '1.5rem', direction: 'rtl', marginBottom: '0.5rem' }}>
          {surah.name_ar}
        </h3>
        <p style={{ fontSize: '1rem', color: '#666' }}>{surah.translation_id}</p>
        <div
          style={{
            display: 'flex',
            justify: 'center',
            gap: '1.5rem',
            marginTop: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span>{surah.total_verses} verses</span>
          <span>{surah.type}</span>
          <span>Juz {surah.juz_start}-{surah.juz_end}</span>
        </div>
      </div>

      <div className="ayahs-container">
        {ayahs.map((ayah) => {
          const isBookmarked = bookmarks.has(`${surahId}-${ayah.verse_id}`);

          return (
            <div key={ayah.id} className="ayah-card card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="ayah-number">{ayah.verse_id}</span>
              </div>

              <div className="ayah-text-ar">{ayah.text_ar}</div>

              <div className="ayah-text-id">{ayah.text_id}</div>

              {ayah.transliteration && (
                <div className="ayah-transliteration">{ayah.transliteration}</div>
              )}

              <div className="ayah-actions">
                <button
                  className={`action-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={() => toggleBookmark(ayah.verse_id)}
                  title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  <BookMarked size={16} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button
                  className="action-btn"
                  onClick={() => copyAyah(ayah)}
                  title="Copy verse"
                >
                  <Copy size={16} />
                  Copy
                </button>
                <button
                  className="action-btn"
                  onClick={() => shareAyah(ayah)}
                  title="Share verse"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
