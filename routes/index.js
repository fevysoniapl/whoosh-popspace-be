import express from 'express';
import authRouter from './auth/auth.js';
import stationRouter from './station/station.js';
import boothRouter from './booth/booth.js';
import applicationRouter from './application/application.js';
import adminRouter from './admin/admin.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/api', csrfProtection);
router.use('/api/auth', authRouter);
router.use('/api/stations', stationRouter);
router.use('/api/booths', boothRouter);
router.use('/api/applications', applicationRouter);
router.use('/api/admin', adminRouter);

export default router;