import { Router, Request, Response } from 'express';
import DatabaseService from '../services/database';
import { ApiResponse, PaginatedResponse } from '../types';

const router = Router();
let db: DatabaseService;

function getDb() {
  if (!db) {
    db = new DatabaseService();
  }
  return db;
}

// Get hadiths with pagination
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const database = getDb();

    const { data, total } = database.getHadiths(limit, offset);

    const response: PaginatedResponse<typeof data[0]> = {
      data,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hadiths',
    });
  }
});

// Get specific hadith
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const database = getDb();
    const hadith = database.getHadith(id);

    if (!hadith) {
      return res.status(404).json({
        success: false,
        error: 'Hadith not found',
      });
    }

    const response: ApiResponse<typeof hadith> = {
      success: true,
      data: hadith,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hadith',
    });
  }
});

// Search hadiths
router.get('/search/query', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const database = getDb();

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const results = database.searchHadiths(query);

    const response: PaginatedResponse<typeof results[0]> = {
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
      error: 'Failed to search hadiths',
    });
  }
});

export default router;
