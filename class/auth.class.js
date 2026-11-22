import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import helper from './helper.class.js';
import { config } from '../config/app.config.js';

export const TOKEN_COOKIE = 'token';

class Auth {
  async sessionChecker(req, res, next) {
    try {
      const token = req.cookies?.[TOKEN_COOKIE];
      if (!token) {
        return helper.sendResponse(res, {
          status: false,
          code: 401,
          message: 'Autentikasi diperlukan',
        });
      }

      let payload;
      try {
        payload = jwt.verify(token, config.jwt.secret);
      } catch {
        return helper.sendResponse(res, {
          status: false,
          code: 401,
          message: 'Sesi tidak valid atau kedaluwarsa',
        });
      }

      const user = await db.User.findByPk(payload.sub);
      if (!user) {
        return helper.sendResponse(res, {
          status: false,
          code: 401,
          message: 'Akun tidak ditemukan',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return helper.sendResponse(res, {
        status: false,
        code: 500,
        message: 'Internal server error',
      });
    }
  }

  permissionChecker(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return helper.sendResponse(res, {
          status: false,
          code: 401,
          message: 'Autentikasi diperlukan',
        });
      }
      if (!roles.includes(req.user.role)) {
        return helper.sendResponse(res, {
          status: false,
          code: 403,
          message: 'Akses ditolak untuk role Anda',
        });
      }
      next();
    };
  }
}

export default new Auth();