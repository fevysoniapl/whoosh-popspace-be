import db from '../../models/index.js';
import BaseModule from '../../class/base.module.js';

class StationModule extends BaseModule {
  async list() {
    try {
      const stations = await db.Station.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']],
      });

      return { status: true, data: { stations } };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new StationModule();