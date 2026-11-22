import express from 'express';
import boothModule from '../../module/booth/booth.js';
import helper from '../../class/helper.class.js';

const router = express.Router();

// get list booths (public catalog)
router.get('/', async (req, res) => {
  const result = await boothModule.list(req);
  helper.sendResponse(res, result);
});

// get booth detail
router.get('/:id', async (req, res) => {
  const result = await boothModule.detail(req);
  helper.sendResponse(res, result);
});

// get booth availability
router.get('/:id/availability', async (req, res) => {
  const result = await boothModule.availability(req);
  helper.sendResponse(res, result);
});

export default router;