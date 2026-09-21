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

export interface HadithBookmark {
  id: number;
  hadith_id: number;
  created_at: number;
  note?: string;
}

export interface SearchResult {
  type: 'ayah' | 'hadith';
  id: number;
  text: string;
  source: string;
  metadata: any;
}

export interface LastRead {
  surah_id: number;
  verse_id: number;
  timestamp: number;
}

export interface JuzInfo {
  juz_id: number;
  surah_id: number;
  verse_id: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
