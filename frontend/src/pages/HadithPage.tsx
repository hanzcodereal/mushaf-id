import { useState, useEffect } from 'react';
import { ArrowLeft, BookMarked } from 'lucide-react';
import { apiClient, Hadith, Bookmark } from '../services/api';
import './pages.css';

interface HadithPageProps {
  onBack: () => void;
}

export default function HadithPage({ onBack }: HadithPageProps) {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [hadithBookmarks, setHadithBookmarks] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hadithsData, bookmarksData] = await Promise.all([
          apiClient.getHadiths(page, limit),
          apiClient.getBookmarks(),
        ]);

        setHadiths(hadithsData.data);
        setTotalPages(Math.ceil(hadithsData.total / limit));

        const bookmarkSet = new Set<number>();
        // Note: In a real app, you'd also fetch hadith bookmarks
        setHadithBookmarks(bookmarkSet);
      } catch (err) {
        setError('Failed to load hadiths. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const toggleBookmark = async (hadithId: number) => {
    try {
      if (hadithBookmarks.has(hadithId)) {
        // Would call removeHadithBookmark if implemented
        const newBookmarks = new Set(hadithBookmarks);
        newBookmarks.delete(hadithId);
        setHadithBookmarks(newBookmarks);
      } else {
        // Would call addHadithBookmark if implemented
        const newBookmarks = new Set(hadithBookmarks);
        newBookmarks.add(hadithId);
        setHadithBookmarks(newBookmarks);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
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
        <h1>📚 Hadith</h1>
        <p>Read and explore Hadith (Prophetic traditions)</p>
      </div>

      {loading ? (
        <div className="loading">Loading hadiths...</div>
      ) : (
        <>
          <div className="ayahs-container">
            {hadiths.map((hadith) => (
              <div key={hadith.id} className="hadith-card card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h3 className="hadith-title">{hadith.judul}</h3>
                  <button
                    className={`action-btn ${hadithBookmarks.has(hadith.id) ? 'bookmarked' : ''}`}
                    onClick={() => toggleBookmark(hadith.id)}
                  >
                    <BookMarked size={16} />
                  </button>
                </div>

                <div className="hadith-meta">
                  <span className="hadith-badge">{hadith.kitab}</span>
                  <span>No. {hadith.nomor}</span>
                  <span>{hadith.tema}</span>
                  {hadith.sumber && <span className="hadith-source">Source: {hadith.sumber}</span>}
                </div>

                {hadith.teks_ar && (
                  <div className="hadith-text-ar">{hadith.teks_ar}</div>
                )}

                <div className="hadith-text">{hadith.teks_id}</div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={page === p ? 'active' : ''}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
