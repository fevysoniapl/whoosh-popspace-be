import express from 'express';
import stationModule from '../../module/station/station.js';
import helper from '../../class/helper.class.js';

const router = express.Router();

// get list active stations
router.get('/', async (req, res) => {
  const result = await stationModule.list(req);
  helper.sendResponse(res, result);
});

export default router;