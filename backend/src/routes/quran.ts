import { Router, Request, Response } from 'express';
import DatabaseService from '../services/database';
import { ApiResponse, PaginatedResponse } from '../types';

const router = Router();
let db: DatabaseService;

// Initialize database
function getDb() {
  if (!db) {
    db = new DatabaseService();
  }
  return db;
}

// Get all surahs
router.get('/surahs', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const surahs = database.getSurahs();
    const response: ApiResponse<typeof surahs> = {
      success: true,
      data: surahs,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch surahs',
    });
  }
});

// Get specific surah
router.get('/surahs/:id', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const id = parseInt(req.params.id);
    const surah = database.getSurah(id);

    if (!surah) {
      return res.status(404).json({
        success: false,
        error: 'Surah not found',
      });
    }

    const response: ApiResponse<typeof surah> = {
      success: true,
      data: surah,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch surah',
    });
  }
});

// Get ayahs from a surah
router.get('/surahs/:surahId/ayahs', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const surahId = parseInt(req.params.surahId);
    const surah = database.getSurah(surahId);

    if (!surah) {
      return res.status(404).json({
        success: false,
        error: 'Surah not found',
      });
    }

    const ayahs = database.getAyahs(surahId);
    const response: ApiResponse<typeof ayahs> = {
      success: true,
      data: ayahs,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ayahs',
    });
  }
});

// Get specific ayah
router.get('/surahs/:surahId/ayahs/:verseId', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const surahId = parseInt(req.params.surahId);
    const verseId = parseInt(req.params.verseId);

    const ayah = database.getAyah(surahId, verseId);

    if (!ayah) {
      return res.status(404).json({
        success: false,
        error: 'Ayah not found',
      });
    }

    const response: ApiResponse<typeof ayah> = {
      success: true,
      data: ayah,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ayah',
    });
  }
});

// Search in Quran
router.get('/search', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const results = database.searchAyahs(query);
    const response: PaginatedResponse<any> = {
      data: results,
      total: results.length,
      page: 1,
      limit: results.length,
      hasMore: false,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search',
    });
  }
});

export default router;
