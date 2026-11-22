import { Op } from 'sequelize';
import Joi from 'joi';
import db from '../../models/index.js';
import helper from '../../class/helper.class.js';
import BaseModule from '../../class/base.module.js';

const { Booth, BoothBlock, RentalApplication, Station } = db;

const PENDING_STATUSES = ['DIAJUKAN', 'DALAM_PENINJAUAN', 'PERLU_REVISI'];

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

class BoothModule extends BaseModule {
  async list(req) {
    try {
      const params = req.query;

      const schema = Joi.object({
        station_id: Joi.number().integer().positive(),
        category: Joi.string().trim().max(50),
        has_electricity: Joi.boolean(),
        facility: Joi.string().trim().max(100),
        is_active: Joi.boolean(),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
      });

      const validation = helper.validate(params, schema);
      if (!validation.status) return validation;

      const { station_id, category, has_electricity, facility, is_active } =
        validation.value;
      const { limit, page, offset } = helper.getPagination(params);

      const where = {};
      if (station_id !== undefined) where.stationId = station_id;
      if (category !== undefined) where.category = category;
      if (has_electricity !== undefined) where.hasElectricity = has_electricity;
      if (is_active !== undefined) where.isActive = is_active;
      if (facility !== undefined) {
        where.facilities = { [Op.contains]: [facility] };
      }

      const include = [
        { model: Station, as: 'station', attributes: ['id', 'name'] },
      ];

      const { count, rows } = await Booth.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order: [
          ['stationId', 'ASC'],
          ['code', 'ASC'],
        ],
        distinct: true,
      });

      return {
        status: true,
        data: helper.getPaginationData(rows, count, page, limit),
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async detail(req) {
    try {
      const schema = Joi.object({
        id: Joi.number().integer().positive().required(),
      });

      const validation = helper.validate(req.params, schema);
      if (!validation.status) return validation;

      const booth = await Booth.findByPk(validation.value.id, {
        include: [{ model: Station, as: 'station' }],
      });
      if (!booth) {
        return { status: false, code: 404, message: 'Booth tidak ditemukan' };
      }

      return { status: true, data: { booth } };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async availability(req) {
    try {
      const paramValidation = helper.validate(
        req.params,
        Joi.object({ id: Joi.number().integer().positive().required() })
      );
      if (!paramValidation.status) return paramValidation;

      const querySchema = Joi.object({
        start_date: Joi.date().iso().raw().required(),
        end_date: Joi.date().iso().raw().min(Joi.ref('start_date')).required(),
      }).custom((value, helpers) => {
        if (value.start_date < localToday()) {
          return helpers.message({
            custom: 'start_date tidak boleh tanggal lampau',
          });
        }
        return value;
      });

      const queryValidation = helper.validate(req.query, querySchema);
      if (!queryValidation.status) return queryValidation;

      const id = paramValidation.value.id;
      const { start_date, end_date } = queryValidation.value;

      const booth = await Booth.findByPk(id);
      if (!booth) {
        return { status: false, code: 404, message: 'Booth tidak ditemukan' };
      }

      const overlap = {
        startDate: { [Op.lte]: end_date },
        endDate: { [Op.gte]: start_date },
      };

      const [blocks, applications] = await Promise.all([
        BoothBlock.findAll({
          where: { boothId: id, ...overlap },
          order: [['startDate', 'ASC']],
        }),
        RentalApplication.findAll({
          where: {
            boothId: id,
            status: { [Op.in]: ['DISETUJUI', ...PENDING_STATUSES] },
            ...overlap,
          },
          order: [['startDate', 'ASC']],
        }),
      ]);

      const blocked = blocks.map((block) => ({
        start_date: block.startDate,
        end_date: block.endDate,
        reason: block.reason,
      }));
      const approved = applications
        .filter((application) => application.status === 'DISETUJUI')
        .map((application) => ({
          start_date: application.startDate,
          end_date: application.endDate,
        }));
      const pending = applications
        .filter((application) => PENDING_STATUSES.includes(application.status))
        .map((application) => ({
          start_date: application.startDate,
          end_date: application.endDate,
          status: application.status,
        }));

      return {
        status: true,
        data: {
          booth_id: booth.id,
          booth_code: booth.code,
          is_active: booth.isActive,
          start_date,
          end_date,
          available:
            booth.isActive && blocked.length === 0 && approved.length === 0,
          blocked,
          approved,
          pending,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new BoothModule();