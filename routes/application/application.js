import express from 'express';
import applicationModule from '../../module/application/application.js';
import auth from '../../class/auth.class.js';
import helper from '../../class/helper.class.js';
import { proposalUpload } from '../../class/upload.class.js';

const router = express.Router();

router.use(auth.sessionChecker);

// post create rental application
router.post('/', proposalUpload.single('proposal'), async (req, res) => {
  const result = await applicationModule.create(req, res);
  helper.sendResponse(res, result);
});

// get my applications
router.get('/my', async (req, res) => {
  const result = await applicationModule.myList(req);
  helper.sendResponse(res, result);
});

// get my application detail
router.get('/my/:id', async (req, res) => {
  const result = await applicationModule.myDetail(req);
  helper.sendResponse(res, result);
});

// patch resubmit application after revision
router.patch(
  '/my/:id/resubmit',
  proposalUpload.single('proposal'),
  async (req, res) => {
    const result = await applicationModule.resubmit(req, res);
    helper.sendResponse(res, result);
  }
);

// get my application proposal (private)
router.get('/my/:id/proposal', async (req, res) => {
  const result = await applicationModule.proposal(req, res);
  if (result) helper.sendResponse(res, result);
});

export default router;