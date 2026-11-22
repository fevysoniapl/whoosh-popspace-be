import { config } from '../config/app.config.js';
import helper from '../class/helper.class.js';

export function notFoundHandler(req, res) {
  helper.sendResponse(res, {
    status: false,
    code: 404,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}

export function errorHandler(error, _req, res, _next) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return helper.sendResponse(res, {
      status: false,
      code: 409,
      message: 'Data sudah ada (duplikat)',
    });
  }

  console.error(error);
  if (config.debug) {
    return helper.sendResponse(res, {
      status: false,
      code: 500,
      error: error.message,
    });
  }
  return helper.sendResponse(res, {
    status: false,
    code: 500,
    message: 'Internal server error',
  });
}