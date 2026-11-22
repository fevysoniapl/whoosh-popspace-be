import express from 'express';
import authModule from '../../module/auth/auth.js';
import auth from '../../class/auth.class.js';
import helper from '../../class/helper.class.js';
import { issueCsrfToken } from '../../middleware/csrf.js';

const router = express.Router();

// get csrf token
router.get('/csrf', issueCsrfToken);

// post register
router.post('/register', async (req, res) => {
  const result = await authModule.register(req, res);
  helper.sendResponse(res, result);
});

// post login
router.post('/login', async (req, res) => {
  const result = await authModule.login(req, res);
  helper.sendResponse(res, result);
});

// get current user
router.get('/me', auth.sessionChecker, async (req, res) => {
  const result = await authModule.me(req);
  helper.sendResponse(res, result);
});

// post logout
router.post('/logout', async (req, res) => {
  const result = await authModule.logout(req, res);
  helper.sendResponse(res, result);
});

export default router;