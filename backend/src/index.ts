import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import quranRoutes from './routes/quran';
import hadithRoutes from './routes/hadith';
import bookmarkRoutes from './routes/bookmarks';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// API Routes
app.use('/api/quran', quranRoutes);
app.use('/api/hadith', hadithRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Error handler
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🕌 Mushaf ID API server running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
});

export default app;
