import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { apiClient, Ayah, Hadith } from '../services/api';
import './pages.css';

interface SearchPageProps {
  onSelectSurah: (surahId: number) => void;
  onBack: () => void;
}

export default function SearchPage({ onSelectSurah, onBack }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [quranResults, setQuranResults] = useState<Ayah[]>([]);
  const [hadithResults, setHadithResults] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setQuranResults([]);
      setHadithResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      const [quranData, hadithData] = await Promise.all([
        apiClient.searchQuran(searchQuery),
        apiClient.searchHadith(searchQuery),
      ]);

      setQuranResults(quranData);
      setHadithResults(hadithData);
      setHasSearched(true);
    } catch (err) {
      console.error('Search failed:', err);
      setQuranResults([]);
      setHadithResults([]);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = quranResults.length + hadithResults.length;

  return (
    <div className="page">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="page-header">
        <h1>🔍 Cari</h1>
        <p>Cari di Mushaf ID dan Hadith</p>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Cari Mushaf ID, Hadith, atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          <button type="submit" className="btn btn-primary">
            <Search size={20} />
            Search
          </button>
        </div>
      </form>

      {loading && <div className="loading">Searching...</div>}

      {hasSearched && !loading && totalResults === 0 && (
        <div className="no-results">
          <p>No results found for "{searchQuery}"</p>
          <p style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Try different keywords or search terms
          </p>
        </div>
      )}

      {!loading && totalResults > 0 && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>
              Found <strong>{totalResults}</strong> result{totalResults !== 1 ? 's' : ''}
              {quranResults.length > 0 && (
                <span>
                  {' '}
                  - <strong>{quranResults.length}</strong> in Quran
                </span>
              )}
              {hadithResults.length > 0 && (
                <span>
                  {' '}
                  - <strong>{hadithResults.length}</strong> in Hadith
                </span>
              )}
            </p>
          </div>

          {quranResults.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                Quran Results
              </h2>
              <div className="ayahs-container">
                {quranResults.slice(0, 10).map((ayah) => (
                  <div key={ayah.id} className="ayah-card card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <h4 style={{ color: 'var(--primary)', cursor: 'pointer' }}>
                        Verse {ayah.verse_id}:{ayah.surah_id}
                      </h4>
                      <button
                        className="btn btn-secondary"
                        onClick={() => onSelectSurah(ayah.surah_id)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        View Surah
                      </button>
                    </div>

                    <div className="ayah-text-ar">{ayah.text_ar}</div>
                    <div className="ayah-text-id">{ayah.text_id}</div>
                  </div>
                ))}
              </div>
              {quranResults.length > 10 && (
                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
                  Showing 10 of {quranResults.length} results
                </p>
              )}
            </div>
          )}

          {hadithResults.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                Hadith Results
              </h2>
              <div className="ayahs-container">
                {hadithResults.slice(0, 10).map((hadith) => (
                  <div key={hadith.id} className="hadith-card card">
                    <h4 className="hadith-title">{hadith.judul}</h4>

                    <div className="hadith-meta">
                      <span className="hadith-badge">{hadith.kitab}</span>
                      <span>No. {hadith.nomor}</span>
                      {hadith.tema && <span>{hadith.tema}</span>}
                    </div>

                    {hadith.teks_ar && (
                      <div className="hadith-text-ar">{hadith.teks_ar}</div>
                    )}

                    <div className="hadith-text">{hadith.teks_id.substring(0, 200)}...</div>
                  </div>
                ))}
              </div>
              {hadithResults.length > 10 && (
                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
                  Showing 10 of {hadithResults.length} results
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
