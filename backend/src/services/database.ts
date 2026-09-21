import fs from 'fs';
import path from 'path';
import { Surah, Ayah, Hadith, Bookmark, HadithBookmark } from '../types';

class DatabaseService {
  private surahs: Surah[] = [];
  private ayahs: Map<number, Ayah[]> = new Map();
  private hadiths: Hadith[] = [];
  private bookmarks: Bookmark[] = [];
  private hadithBookmarks: HadithBookmark[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      // Try multiple paths untuk Vercel deployment
      const possiblePaths = [
        path.join(__dirname, '../../data'),
        path.join(__dirname, '../../../data'),
        path.join(process.cwd(), 'data'),
        '/tmp/data',
      ];

      let dataDir = '';
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          dataDir = p;
          break;
        }
      }

      if (!dataDir) {
        console.warn('Data directory not found, using memory cache only');
        return;
      }

      // Load Surahs
      const surahsPath = path.join(dataDir, 'surahs.json');
      if (fs.existsSync(surahsPath)) {
        const data = fs.readFileSync(surahsPath, 'utf-8');
        this.surahs = JSON.parse(data);
      }

      // Load Ayahs
      const ayahsPath = path.join(dataDir, 'ayahs_preview.json');
      if (fs.existsSync(ayahsPath)) {
        const data = fs.readFileSync(ayahsPath, 'utf-8');
        const ayahs: Ayah[] = JSON.parse(data);
        for (const ayah of ayahs) {
          if (!this.ayahs.has(ayah.surah_id)) {
            this.ayahs.set(ayah.surah_id, []);
          }
          this.ayahs.get(ayah.surah_id)!.push(ayah);
        }
      }

      // Load Hadiths (split into 5 parts)
      let allHadiths: Hadith[] = [];
      for (let i = 1; i <= 5; i++) {
        const hadithPartPath = path.join(dataDir, `hadiths_part${i}.json`);
        if (fs.existsSync(hadithPartPath)) {
          const data = fs.readFileSync(hadithPartPath, 'utf-8');
          const hadithsPart: Hadith[] = JSON.parse(data);
          allHadiths = allHadiths.concat(hadithsPart);
        }
      }
      this.hadiths = allHadiths;

      console.log(`✅ Data loaded: ${this.surahs.length} surahs, ${this.hadiths.length} hadiths`);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // Surah Methods
  getSurahs(): Surah[] {
    return this.surahs;
  }

  getSurah(id: number): Surah | undefined {
    return this.surahs.find(s => s.id === id);
  }

  // Ayah Methods
  getAyahs(surahId: number): Ayah[] {
    return this.ayahs.get(surahId) || [];
  }

  getAyah(surahId: number, verseId: number): Ayah | undefined {
    const ayahs = this.ayahs.get(surahId) || [];
    return ayahs.find(a => parseInt(String(a.verse_id)) === verseId);
  }

  // Search Methods
  searchAyahs(query: string): Ayah[] {
    const q = query.toLowerCase();
    const results: Ayah[] = [];

    for (const ayahs of this.ayahs.values()) {
      for (const ayah of ayahs) {
        if (
          ayah.text_ar.includes(query) ||
          ayah.text_id.toLowerCase().includes(q) ||
          ayah.transliteration.toLowerCase().includes(q)
        ) {
          results.push(ayah);
        }
      }
    }

    return results;
  }

  // Hadith Methods
  getHadiths(limit?: number, offset?: number): { data: Hadith[]; total: number } {
    let result = this.hadiths;
    const total = result.length;

    if (offset) {
      result = result.slice(offset);
    }
    if (limit) {
      result = result.slice(0, limit);
    }

    return { data: result, total };
  }

  getHadith(id: number): Hadith | undefined {
    return this.hadiths.find(h => h.id === id);
  }

  searchHadiths(query: string): Hadith[] {
    const q = query.toLowerCase();
    return this.hadiths.filter(h =>
      h.judul.toLowerCase().includes(q) ||
      h.teks_ar.toLowerCase().includes(q) ||
      h.teks_id.toLowerCase().includes(q) ||
      h.tema.toLowerCase().includes(q)
    );
  }

  // Bookmark Methods
  getBookmarks(): Bookmark[] {
    return this.bookmarks;
  }

  getBookmark(surahId: number, verseId: number): Bookmark | undefined {
    return this.bookmarks.find(b => b.surah_id === surahId && b.verse_id === verseId);
  }

  addBookmark(surahId: number, verseId: number, note?: string): Bookmark {
    const id = this.bookmarks.length > 0 ? Math.max(...this.bookmarks.map(b => b.id)) + 1 : 1;
    const bookmark: Bookmark = {
      id,
      surah_id: surahId,
      verse_id: verseId,
      created_at: Date.now(),
      note,
    };
    this.bookmarks.push(bookmark);
    this.saveBookmarks();
    return bookmark;
  }

  removeBookmark(surahId: number, verseId: number): boolean {
    const index = this.bookmarks.findIndex(b => b.surah_id === surahId && b.verse_id === verseId);
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      this.saveBookmarks();
      return true;
    }
    return false;
  }

  updateBookmarkNote(surahId: number, verseId: number, note: string): boolean {
    const bookmark = this.getBookmark(surahId, verseId);
    if (bookmark) {
      bookmark.note = note;
      this.saveBookmarks();
      return true;
    }
    return false;
  }

  private saveBookmarks(): void {
    const bookmarksPath = path.join(this.dataDir, 'bookmarks.json');
    fs.writeFileSync(bookmarksPath, JSON.stringify(this.bookmarks, null, 2), 'utf-8');
  }

  // Hadith Bookmark Methods
  getHadithBookmarks(): HadithBookmark[] {
    return this.hadithBookmarks;
  }

  getHadithBookmark(hadithId: number): HadithBookmark | undefined {
    return this.hadithBookmarks.find(b => b.hadith_id === hadithId);
  }

  addHadithBookmark(hadithId: number, note?: string): HadithBookmark {
    const id = this.hadithBookmarks.length > 0 ? Math.max(...this.hadithBookmarks.map(b => b.id)) + 1 : 1;
    const bookmark: HadithBookmark = {
      id,
      hadith_id: hadithId,
      created_at: Date.now(),
      note,
    };
    this.hadithBookmarks.push(bookmark);
    this.saveHadithBookmarks();
    return bookmark;
  }

  removeHadithBookmark(hadithId: number): boolean {
    const index = this.hadithBookmarks.findIndex(b => b.hadith_id === hadithId);
    if (index !== -1) {
      this.hadithBookmarks.splice(index, 1);
      this.saveHadithBookmarks();
      return true;
    }
    return false;
  }

  private saveHadithBookmarks(): void {
    const hadithBookmarksPath = path.join(this.dataDir, 'hadith_bookmarks.json');
    fs.writeFileSync(hadithBookmarksPath, JSON.stringify(this.hadithBookmarks, null, 2), 'utf-8');
  }
}

export default DatabaseService;
