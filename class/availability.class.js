import { Op } from 'sequelize';
import db from '../models/index.js';

export const PENDING_STATUSES = ['DIAJUKAN', 'DALAM_PENINJAUAN', 'PERLU_REVISI'];

class Availability {
  async findConflicts(boothId, startDate, endDate, options = {}) {
    const { transaction, excludeApplicationId } = options;
    const overlap = {
      startDate: { [Op.lte]: endDate },
      endDate: { [Op.gte]: startDate },
    };

    const applicationWhere = {
      boothId,
      status: 'DISETUJUI',
      ...overlap,
    };
    if (excludeApplicationId) {
      applicationWhere.id = { [Op.ne]: excludeApplicationId };
    }

    const [blocks, approved] = await Promise.all([
      db.BoothBlock.findAll({
        where: { boothId, ...overlap },
        order: [['startDate', 'ASC']],
        transaction,
      }),
      db.RentalApplication.findAll({
        where: applicationWhere,
        order: [['startDate', 'ASC']],
        transaction,
      }),
    ]);

    return { blocks, approved };
  }

  async findPending(boothId, startDate, endDate, options = {}) {
    const { transaction } = options;
    return db.RentalApplication.findAll({
      where: {
        boothId,
        status: { [Op.in]: PENDING_STATUSES },
        startDate: { [Op.lte]: endDate },
        endDate: { [Op.gte]: startDate },
      },
      order: [['startDate', 'ASC']],
      transaction,
    });
  }
}

export default new Availability();