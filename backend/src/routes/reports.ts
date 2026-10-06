import { Router, Request, Response } from 'express';
import { db, reports } from '../db/index.js';
import { desc, eq } from 'drizzle-orm';

const router = Router();

// GET /api/reports - Fetch all reports
router.get('/', async (_req: Request, res: Response) => {
  try {
    const allReports = await db.select().from(reports).orderBy(desc(reports.ts));
    return res.json({ success: true, data: allReports });
  } catch (err: any) {
    console.error('Fetch reports error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch reports' });
  }
});

// POST /api/reports - Add a new hazard report
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, lat, lng, type, description, src, verified, ts, lang, sentiment, media } = req.body;

    if (!id || lat === undefined || lng === undefined || !type || !description) {
      return res.status(400).json({ success: false, error: 'Missing required report fields.' });
    }

    const [inserted] = await db
      .insert(reports)
      .values({
        id: String(id),
        lat: Number(lat),
        lng: Number(lng),
        type: String(type),
        description: String(description),
        src: src || 'citizen',
        verified: Boolean(verified),
        ts: Number(ts || Date.now()),
        lang: String(lang || 'en'),
        sentiment: Number(sentiment || 0),
        media: media || [],
      })
      .returning();

    return res.status(201).json({ success: true, data: inserted });
  } catch (err: any) {
    console.error('Add report error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to save report' });
  }
});

// PATCH /api/reports/:id/verify - Verify a report
router.patch('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(reports)
      .set({ verified: true })
      .where(eq(reports.id, String(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Verify report error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to verify report' });
  }
});

export default router;
