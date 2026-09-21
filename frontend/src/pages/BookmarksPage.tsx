import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { apiClient, Surah, Ayah, Bookmark } from '../services/api';
import './pages.css';

interface BookmarksPageProps {
  onSelectSurah: (surahId: number) => void;
  onBack: () => void;
}

interface BookmarkWithData extends Bookmark {
  surah?: Surah;
  ayah?: Ayah;
}

export default function BookmarksPage({ onSelectSurah, onBack }: BookmarksPageProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithData[]>([]);
  const [surahs, setSurahs] = useState<Map<number, Surah>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookmarksData, surahsData] = await Promise.all([
          apiClient.getBookmarks(),
          apiClient.getSurahs(),
        ]);

        const surahMap = new Map(surahsData.map(s => [s.id, s]));
        setSurahs(surahMap);

        // Enrich bookmarks with surah data
        const enrichedBookmarks: BookmarkWithData[] = bookmarksData.map(b => ({
          ...b,
          surah: surahMap.get(b.surah_id),
        }));

        setBookmarks(enrichedBookmarks);
      } catch (err) {
        setError('Failed to load bookmarks. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const removeBookmark = async (surahId: number, verseId: number) => {
    try {
      await apiClient.removeBookmark(surahId, verseId);
      setBookmarks(bookmarks.filter(
        b => !(b.surah_id === surahId && b.verse_id === verseId)
      ));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

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

  return (
    <div className="page">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="page-header">
        <h1>🔖 My Bookmarks</h1>
        <p>{bookmarks.length} bookmarked verses</p>
      </div>

      {loading ? (
        <div className="loading">Loading bookmarks...</div>
      ) : bookmarks.length === 0 ? (
        <div className="no-results" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No bookmarks yet</p>
          <p>Start bookmarking verses while reading to see them here</p>
          <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Start Reading
          </button>
        </div>
      ) : (
        <div className="ayahs-container">
          {bookmarks.map((bookmark) => (
            <div key={`${bookmark.surah_id}-${bookmark.verse_id}`} className="ayah-card card">
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  style={{ cursor: 'pointer', flex: 1 }}
                  onClick={() => onSelectSurah(bookmark.surah_id)}
                >
                  <h4 style={{ marginBottom: '0.25rem', color: 'var(--primary)' }}>
                    {bookmark.surah?.name_latin} ({bookmark.verse_id}:{bookmark.surah_id})
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    {bookmark.surah?.translation_id}
                  </p>
                </div>
                <button
                  className="action-btn"
                  onClick={() => removeBookmark(bookmark.surah_id, bookmark.verse_id)}
                  title="Delete bookmark"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {bookmark.note && (
                <div style={{
                  background: 'rgba(212, 165, 116, 0.1)',
                  padding: '0.75rem',
                  borderRadius: '0.35rem',
                  marginBottom: '0.75rem',
                  borderLeft: '3px solid var(--accent)',
                }}>
                  <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>📝 {bookmark.note}</p>
                </div>
              )}

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => onSelectSurah(bookmark.surah_id)}
                  style={{ width: '100%' }}
                >
                  View in Surah
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
    }
