import { useState, useEffect } from 'react';
import { apiClient, Surah } from '../services/api';
import './pages.css';

interface HomePageProps {
  onSelectSurah: (surahId: number) => void;
}

export default function HomePage({ onSelectSurah }: HomePageProps) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getSurahs();
        setSurahs(data);
      } catch (err) {
        setError('Failed to load surahs. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.name_latin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.translation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.id.toString() === searchTerm
  );

  if (loading) {
    return <div className="loading">Loading surahs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📖 Mushaf ID</h1>
        <p>Pilih surah untuk mulai membaca</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search surah by name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="surahs-grid">
        {filteredSurahs.length > 0 ? (
          filteredSurahs.map((surah) => (
            <div
              key={surah.id}
              className="surah-card card"
              onClick={() => onSelectSurah(surah.id)}
            >
              <div className="surah-number">{surah.id}</div>
              <div className="surah-info">
                <h3 className="surah-name">{surah.name_latin}</h3>
                <p className="surah-ar">{surah.name_ar}</p>
                <p className="surah-translation">{surah.translation_id}</p>
              </div>
              <div className="surah-meta">
                <span className="verse-count">{surah.total_verses} verses</span>
                <span className="surah-type">{surah.type}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">No surahs found matching your search.</div>
        )}
      </div>
    </div>
  );
}
