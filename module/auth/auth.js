import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import db from '../../models/index.js';
import { config } from '../../config/app.config.js';
import helper from '../../class/helper.class.js';
import BaseModule from '../../class/base.module.js';
import { TOKEN_COOKIE } from '../../class/auth.class.js';
import { clearCsrfCookie } from '../../middleware/csrf.js';
import { baseCookieOptions } from '../../utils/cookie.js';

const SALT_ROUNDS = 10;

class AuthModule extends BaseModule {
  signToken(user) {
    return jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  setTokenCookie(res, token) {
    const { exp } = jwt.decode(token);
    res.cookie(TOKEN_COOKIE, token, {
      ...baseCookieOptions(),
      httpOnly: true,
      maxAge: exp * 1000 - Date.now(),
    });
  }

  async register(req, res) {
    try {
      const schema = Joi.object({
        name: Joi.string().trim().min(3).max(100).required(),
        email: Joi.string()
          .trim()
          .lowercase()
          .email({ tlds: { allow: false } })
          .max(255)
          .required(),
        password: Joi.string().min(8).max(72).required(),
        phone: Joi.string()
          .trim()
          .pattern(/^[0-9+\-\s]{6,20}$/)
          .allow('', null)
          .optional(),
      });

      const validation = helper.validate(req.body, schema);
      if (!validation.status) return validation;

      const { name, email, password, phone } = validation.value;

      const existing = await db.User.findOne({ where: { email } });
      if (existing) {
        return { status: false, code: 409, message: 'Email sudah terdaftar' };
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const created = await db.User.create({
        name,
        email,
        passwordHash,
        phone: phone || null,
        role: 'USER',
      });
      const user = await db.User.findByPk(created.id);

      this.setTokenCookie(res, this.signToken(created));

      return {
        status: true,
        code: 201,
        message: 'Registrasi berhasil',
        data: { user },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async login(req, res) {
    try {
      const schema = Joi.object({
        email: Joi.string()
          .trim()
          .lowercase()
          .email({ tlds: { allow: false } })
          .required(),
        password: Joi.string().required(),
      });

      const validation = helper.validate(req.body, schema);
      if (!validation.status) return validation;

      const { email, password } = validation.value;

      const user = await db.User.scope('withPassword').findOne({
        where: { email },
      });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return {
          status: false,
          code: 401,
          message: 'Email atau password salah',
        };
      }

      const safeUser = await db.User.findByPk(user.id);
      this.setTokenCookie(res, this.signToken(user));

      return {
        status: true,
        message: 'Login berhasil',
        data: { user: safeUser },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async me(req) {
    try {
      return { status: true, data: { user: req.user } };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie(TOKEN_COOKIE, {
        ...baseCookieOptions(),
        httpOnly: true,
      });
      clearCsrfCookie(res);
      return { status: true, message: 'Logout berhasil' };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new AuthModule();