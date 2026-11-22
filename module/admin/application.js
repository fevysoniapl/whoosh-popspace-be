import fs from 'node:fs';
import path from 'node:path';
import Joi from 'joi';
import db from '../../models/index.js';
import helper from '../../class/helper.class.js';
import BaseModule from '../../class/base.module.js';
import availability from '../../class/availability.class.js';
import { STORAGE_ROOT } from '../../class/upload.class.js';

const { Booth, Station, User, RentalApplication, ApplicationStatusHistory } = db;

const ALL_STATUSES = [
  'DIAJUKAN',
  'DALAM_PENINJAUAN',
  'PERLU_REVISI',
  'DISETUJUI',
  'DITOLAK',
  'DIBATALKAN',
];

const ALLOWED_TRANSITIONS = {
  DIAJUKAN: ['DALAM_PENINJAUAN', 'DISETUJUI', 'DITOLAK', 'PERLU_REVISI'],
  DALAM_PENINJAUAN: ['DISETUJUI', 'DITOLAK', 'PERLU_REVISI'],
  PERLU_REVISI: ['DITOLAK'],
};

const applicationIncludes = [
  { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
  {
    model: Booth,
    as: 'booth',
    attributes: ['id', 'code', 'name', 'dailyRate', 'minimumDays'],
    include: [{ model: Station, as: 'station', attributes: ['id', 'name'] }],
  },
];

class AdminApplicationModule extends BaseModule {
  async list(req) {
    try {
      const schema = Joi.object({
        status: Joi.string().valid(...ALL_STATUSES),
        booth_id: Joi.number().integer().positive(),
        station_id: Joi.number().integer().positive(),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
      });

      const validation = helper.validate(req.query, schema);
      if (!validation.status) return validation;

      const { status, booth_id, station_id } = validation.value;
      const { limit, page, offset } = helper.getPagination(req.query);

      const where = {};
      if (status) where.status = status;
      if (booth_id) where.boothId = booth_id;

      const boothInclude = {
        model: Booth,
        as: 'booth',
        attributes: ['id', 'code', 'name'],
        include: [{ model: Station, as: 'station', attributes: ['id', 'name'] }],
      };
      if (station_id) {
        boothInclude.where = { stationId: station_id };
      }

      const { count, rows } = await RentalApplication.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          boothInclude,
        ],
        order: [['submittedAt', 'DESC']],
        limit,
        offset,
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
      const validation = helper.validate(
        req.params,
        Joi.object({ id: Joi.number().integer().positive().required() })
      );
      if (!validation.status) return validation;

      const application = await RentalApplication.findByPk(validation.value.id, {
        include: [
          ...applicationIncludes,
          {
            model: ApplicationStatusHistory,
            as: 'statusHistory',
            include: [
              { model: User, as: 'changedByUser', attributes: ['id', 'name', 'role'] },
            ],
          },
        ],
        order: [
          [{ model: ApplicationStatusHistory, as: 'statusHistory' }, 'createdAt', 'ASC'],
        ],
      });

      if (!application) {
        return {
          status: false,
          code: 404,
          message: 'Pengajuan tidak ditemukan',
        };
      }

      return { status: true, data: { application } };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateStatus(req) {
    try {
      const paramValidation = helper.validate(
        req.params,
        Joi.object({ id: Joi.number().integer().positive().required() })
      );
      if (!paramValidation.status) return paramValidation;

      const schema = Joi.object({
        status: Joi.string()
          .valid('DALAM_PENINJAUAN', 'DISETUJUI', 'DITOLAK', 'PERLU_REVISI')
          .required(),
        note: Joi.string().trim().max(1000).when('status', {
          is: Joi.valid('DITOLAK', 'PERLU_REVISI'),
          then: Joi.required(),
          otherwise: Joi.allow('', null).optional(),
        }),
      });

      const validation = helper.validate(req.body, schema);
      if (!validation.status) return validation;

      const { status: newStatus, note } = validation.value;
      const id = paramValidation.value.id;

      const t = await db.sequelize.transaction();
      try {
        const application = await RentalApplication.findByPk(id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!application) {
          await t.rollback();
          return {
            status: false,
            code: 404,
            message: 'Pengajuan tidak ditemukan',
          };
        }

        const oldStatus = application.status;
        const allowed = ALLOWED_TRANSITIONS[oldStatus] || [];
        if (!allowed.includes(newStatus)) {
          await t.rollback();
          return {
            status: false,
            code: 409,
            message: `Perubahan status dari ${oldStatus} ke ${newStatus} tidak diizinkan`,
          };
        }

        if (newStatus === 'DISETUJUI') {
          // Lock baris booth agar approval pada booth yang sama terserialisasi
          const booth = await Booth.findByPk(application.boothId, {
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          if (!booth || !booth.isActive) {
            await t.rollback();
            return {
              status: false,
              code: 400,
              message: 'Booth tidak ditemukan atau tidak aktif',
            };
          }

          const { blocks, approved } = await availability.findConflicts(
            booth.id,
            application.startDate,
            application.endDate,
            { transaction: t, excludeApplicationId: application.id }
          );
          if (blocks.length > 0 || approved.length > 0) {
            await t.rollback();
            return {
              status: false,
              code: 409,
              message:
                'Persetujuan ditolak: periode bertabrakan dengan blokir atau pengajuan yang sudah disetujui',
              details: {
                blocked: blocks.map((b) => ({
                  start_date: b.startDate,
                  end_date: b.endDate,
                })),
                approved: approved.map((a) => ({
                  start_date: a.startDate,
                  end_date: a.endDate,
                  application_id: a.id,
                })),
              },
            };
          }
        }

        await application.update(
          {
            status: newStatus,
            adminNote: note || application.adminNote,
          },
          { transaction: t }
        );

        await ApplicationStatusHistory.create(
          {
            applicationId: application.id,
            oldStatus,
            newStatus,
            note: note || null,
            changedBy: req.user.id,
          },
          { transaction: t }
        );

        await t.commit();

        return {
          status: true,
          message: `Status pengajuan diubah menjadi ${newStatus}`,
          data: { application },
        };
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async proposal(req, res) {
    try {
      const validation = helper.validate(
        req.params,
        Joi.object({ id: Joi.number().integer().positive().required() })
      );
      if (!validation.status) return validation;

      const application = await RentalApplication.findByPk(validation.value.id);
      if (!application) {
        return {
          status: false,
          code: 404,
          message: 'Pengajuan tidak ditemukan',
        };
      }
      if (!application.proposalUrl) {
        return {
          status: false,
          code: 404,
          message: 'Proposal tidak tersedia',
        };
      }

      const absolutePath = path.join(STORAGE_ROOT, application.proposalUrl);
      if (!fs.existsSync(absolutePath)) {
        return {
          status: false,
          code: 404,
          message: 'File proposal tidak ditemukan',
        };
      }

      res.sendFile(absolutePath, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${application.applicationNumber}.pdf"`,
        },
      });
      return null;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new AdminApplicationModule();