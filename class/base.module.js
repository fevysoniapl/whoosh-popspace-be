import { config } from '../config/app.config.js';

export default class BaseModule {
  handleError(error) {
    console.error(error);
    if (config.debug) {
      return { status: false, error: error.message, code: 500 };
    }
    return { status: false, message: 'Internal server error', code: 500 };
  }
}