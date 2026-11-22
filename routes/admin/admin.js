import express from 'express';
import dashboardModule from '../../module/admin/dashboard.js';
import adminBoothModule from '../../module/admin/booth.js';
import adminApplicationModule from '../../module/admin/application.js';
import auth from '../../class/auth.class.js';
import helper from '../../class/helper.class.js';
import { boothImageUpload } from '../../class/upload.class.js';

const router = express.Router();

router.use(auth.sessionChecker, auth.permissionChecker(['ADMIN']));

// get dashboard summary
router.get('/dashboard', async (req, res) => {
  const result = await dashboardModule.summary(req);
  helper.sendResponse(res, result);
});

// get list booths (including inactive)
router.get('/booths', async (req, res) => {
  const result = await adminBoothModule.list(req);
  helper.sendResponse(res, result);
});

// post add booth
router.post('/booths', boothImageUpload.single('image'), async (req, res) => {
  const result = await adminBoothModule.add(req, res);
  helper.sendResponse(res, result);
});

// patch update booth
router.patch(
  '/booths/:id',
  boothImageUpload.single('image'),
  async (req, res) => {
    const result = await adminBoothModule.update(req, res);
    helper.sendResponse(res, result);
  }
);

// post add booth date blocks
router.post('/booths/:id/blocks', async (req, res) => {
  const result = await adminBoothModule.addBlock(req);
  helper.sendResponse(res, result);
});

// get list applications
router.get('/applications', async (req, res) => {
  const result = await adminApplicationModule.list(req);
  helper.sendResponse(res, result);
});

// get application detail
router.get('/applications/:id', async (req, res) => {
  const result = await adminApplicationModule.detail(req);
  helper.sendResponse(res, result);
});

// get application proposal (admin only)
router.get('/applications/:id/proposal', async (req, res) => {
  const result = await adminApplicationModule.proposal(req, res);
  if (result) helper.sendResponse(res, result);
});

// patch application status decision
router.patch('/applications/:id/status', async (req, res) => {
  const result = await adminApplicationModule.updateStatus(req);
  helper.sendResponse(res, result);
});

export default router;