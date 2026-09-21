import axios, { AxiosInstance } from 'axios';

export interface Surah {
  id: number;
  name_ar: string;
  name_latin: string;
  translation_id: string;
  type: string;
  total_verses: number;
  juz_start: number;
  juz_end: number;
}

export interface Ayah {
  id: number;
  surah_id: number;
  verse_id: number;
  juz_id: number;
  text_ar: string;
  text_id: string;
  transliteration: string;
}

export interface Hadith {
  id: number;
  kitab: string;
  nomor: number;
  judul: string;
  sumber: string;
  teks_ar: string;
  teks_id: string;
  tema: string;
}

export interface Bookmark {
  id: number;
  surah_id: number;
  verse_id: number;
  created_at: number;
  note?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Quran endpoints
  async getSurahs(): Promise<Surah[]> {
    const response = await this.client.get('/quran/surahs');
    return response.data.data;
  }

  async getSurah(id: number): Promise<Surah> {
    const response = await this.client.get(`/quran/surahs/${id}`);
    return response.data.data;
  }

  async getAyahs(surahId: number): Promise<Ayah[]> {
    const response = await this.client.get(`/quran/surahs/${surahId}/ayahs`);
    return response.data.data;
  }

  async getAyah(surahId: number, verseId: number): Promise<Ayah> {
    const response = await this.client.get(`/quran/surahs/${surahId}/ayahs/${verseId}`);
    return response.data.data;
  }

  async searchQuran(query: string): Promise<Ayah[]> {
    const response = await this.client.get('/quran/search', {
      params: { q: query },
    });
    return response.data.data;
  }

  // Hadith endpoints
  async getHadiths(page = 1, limit = 10): Promise<PaginatedResponse<Hadith>> {
    const response = await this.client.get('/hadith', {
      params: { page, limit },
    });
    return response.data;
  }

  async getHadith(id: number): Promise<Hadith> {
    const response = await this.client.get(`/hadith/${id}`);
    return response.data.data;
  }

  async searchHadith(query: string): Promise<Hadith[]> {
    const response = await this.client.get('/hadith/search/query', {
      params: { q: query },
    });
    return response.data.data;
  }

  // Bookmark endpoints
  async getBookmarks(): Promise<Bookmark[]> {
    const response = await this.client.get('/bookmarks');
    return response.data.data;
  }

  async isBookmarked(surahId: number, verseId: number): Promise<boolean> {
    const response = await this.client.get(`/bookmarks/${surahId}/${verseId}`);
    return response.data.data.bookmarked;
  }

  async addBookmark(surahId: number, verseId: number, note?: string): Promise<Bookmark> {
    const response = await this.client.post('/bookmarks', {
      surahId,
      verseId,
      note,
    });
    return response.data.data;
  }

  async updateBookmarkNote(surahId: number, verseId: number, note: string): Promise<Bookmark> {
    const response = await this.client.put(`/bookmarks/${surahId}/${verseId}`, { note });
    return response.data.data;
  }

  async removeBookmark(surahId: number, verseId: number): Promise<void> {
    await this.client.delete(`/bookmarks/${surahId}/${verseId}`);
  }
}

export const apiClient = new ApiClient();
