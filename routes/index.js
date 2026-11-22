import express from 'express';
import authRouter from './auth/auth.js';
import stationRouter from './station/station.js';
import boothRouter from './booth/booth.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/api', csrfProtection);
router.use('/api/auth', authRouter);
router.use('/api/stations', stationRouter);
router.use('/api/booths', boothRouter);

export default router;