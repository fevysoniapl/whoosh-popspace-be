import crypto from 'node:crypto';
import helper from '../class/helper.class.js';
import { baseCookieOptions } from '../utils/cookie.js';

export const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function issueCsrfToken(_req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    ...baseCookieOptions(),
    httpOnly: false,
  });
  helper.sendResponse(res, { status: true, data: { csrf_token: token } });
}

export function csrfProtection(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get(CSRF_HEADER);

  if (
    !cookieToken ||
    !headerToken ||
    cookieToken.length !== headerToken.length ||
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    return helper.sendResponse(res, {
      status: false,
      code: 403,
      message: 'Token CSRF tidak valid atau hilang',
    });
  }

  next();
}

export function clearCsrfCookie(res) {
  res.clearCookie(CSRF_COOKIE, { ...baseCookieOptions(), httpOnly: false });
}