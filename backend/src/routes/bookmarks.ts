import { Router, Request, Response } from 'express';
import DatabaseService from '../services/database';
import { ApiResponse } from '../types';

const router = Router();
let db: DatabaseService;

function getDb() {
  if (!db) {
    db = new DatabaseService();
  }
  return db;
}

// Get all bookmarks
router.get('/', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const bookmarks = database.getBookmarks();
    const response: ApiResponse<typeof bookmarks> = {
      success: true,
      data: bookmarks,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookmarks',
    });
  }
});

// Check if verse is bookmarked
router.get('/:surahId/:verseId', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const surahId = parseInt(req.params.surahId);
    const verseId = parseInt(req.params.verseId);

    const bookmark = database.getBookmark(surahId, verseId);

    const response: ApiResponse<{ bookmarked: boolean; bookmark?: typeof bookmark }> = {
      success: true,
      data: {
        bookmarked: !!bookmark,
        bookmark,
      },
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check bookmark',
    });
  }
});

// Add bookmark
router.post('/', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const { surahId, verseId, note } = req.body;

    if (!surahId || !verseId) {
      return res.status(400).json({
        success: false,
        error: 'surahId and verseId are required',
      });
    }

    // Check if already bookmarked
    const existing = database.getBookmark(surahId, verseId);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Verse is already bookmarked',
      });
    }

    const bookmark = database.addBookmark(surahId, verseId, note);

    const response: ApiResponse<typeof bookmark> = {
      success: true,
      data: bookmark,
    };
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add bookmark',
    });
  }
});

// Update bookmark note
router.put('/:surahId/:verseId', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const surahId = parseInt(req.params.surahId);
    const verseId = parseInt(req.params.verseId);
    const { note } = req.body;

    const updated = database.updateBookmarkNote(surahId, verseId, note);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found',
      });
    }

    const bookmark = database.getBookmark(surahId, verseId);

    const response: ApiResponse<typeof bookmark> = {
      success: true,
      data: bookmark,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update bookmark',
    });
  }
});

// Delete bookmark
router.delete('/:surahId/:verseId', (req: Request, res: Response) => {
  try {
    const database = getDb();
    const surahId = parseInt(req.params.surahId);
    const verseId = parseInt(req.params.verseId);

    const deleted = database.removeBookmark(surahId, verseId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found',
      });
    }

    const response: ApiResponse<{ deleted: true }> = {
      success: true,
      data: { deleted: true },
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete bookmark',
    });
  }
});

export default router;
