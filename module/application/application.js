import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Op } from 'sequelize';
import Joi from 'joi';
import db from '../../models/index.js';
import helper from '../../class/helper.class.js';
import BaseModule from '../../class/base.module.js';
import availability, {
  PENDING_STATUSES,
} from '../../class/availability.class.js';
import {
  STORAGE_ROOT,
  discardUpload,
  removeStoredFile,
} from '../../class/upload.class.js';

const { Booth, Station, RentalApplication, ApplicationStatusHistory } = db;

const DAY_MS = 24 * 60 * 60 * 1000;

function durationDays(startDate, endDate) {
  return Math.round((new Date(endDate) - new Date(startDate)) / DAY_MS) + 1;
}

function generateApplicationNumber() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const ymd = `${now.getFullYear()}${month}${day}`;
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `WPS-${ymd}-${suffix}`;
}

const businessFields = {
  business_name: Joi.string().trim().max(150),
  business_category: Joi.string().trim().max(50),
  pic_name: Joi.string().trim().max(100),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(255),
  phone: Joi.string().trim().pattern(/^[0-9+\-\s]{6,20}$/),
  description: Joi.string().trim().allow('', null),
};

const dateRangeSchema = Joi.object({
  start_date: Joi.date().iso().raw().required(),
  end_date: Joi.date().iso().raw().min(Joi.ref('start_date')).required(),
}).custom((value, helpers) => {
  if (value.start_date < helper.today()) {
    return helpers.message({
      custom: 'start_date tidak boleh tanggal lampau',
    });
  }
  return value;
});

class ApplicationModule extends BaseModule {
  async checkBoothAvailability(booth, startDate, endDate, options = {}) {
    const { blocks, approved } = await availability.findConflicts(
      booth.id,
      startDate,
      endDate,
      options
    );

    if (blocks.length > 0 || approved.length > 0) {
      return {
        status: false,
        code: 409,
        message: 'Periode yang dipilih tidak tersedia untuk booth ini',
        details: {
          blocked: blocks.map((b) => ({
            start_date: b.startDate,
            end_date: b.endDate,
            reason: b.reason,
          })),
          approved: approved.map((a) => ({
            start_date: a.startDate,
            end_date: a.endDate,
          })),
        },
      };
    }
    return null;
  }

  async create(req, res) {
    try {
      const schema = Joi.object({
        booth_id: Joi.number().integer().positive().required(),
        ...Object.fromEntries(
          Object.entries(businessFields).map(([key, rule]) => [
            key,
            key === 'description' ? rule : rule.required(),
          ])
        ),
        start_date: Joi.date().iso().raw().required(),
        end_date: Joi.date().iso().raw().required(),
      });

      const validation = helper.validate(req.body, schema);
      if (!validation.status) {
        discardUpload(req);
        return validation;
      }

      const data = validation.value;

      if (!req.file) {
        return {
          status: false,
          code: 400,
          message: 'Proposal PDF wajib diunggah (field "proposal")',
        };
      }

      const dateValidation = helper.validate(
        { start_date: data.start_date, end_date: data.end_date },
        dateRangeSchema
      );
      if (!dateValidation.status) {
        discardUpload(req);
        return dateValidation;
      }

      const booth = await Booth.findByPk(data.booth_id);
      if (!booth) {
        discardUpload(req);
        return { status: false, code: 404, message: 'Booth tidak ditemukan' };
      }
      if (!booth.isActive) {
        discardUpload(req);
        return { status: false, code: 400, message: 'Booth tidak aktif' };
      }

      const duration = durationDays(data.start_date, data.end_date);
      if (duration < booth.minimumDays) {
        discardUpload(req);
        return {
          status: false,
          code: 400,
          message: `Durasi minimum sewa booth ini ${booth.minimumDays} hari`,
        };
      }

      const duplicate = await RentalApplication.findOne({
        where: {
          userId: req.user.id,
          boothId: booth.id,
          startDate: data.start_date,
          endDate: data.end_date,
          status: { [Op.in]: PENDING_STATUSES },
        },
      });
      if (duplicate) {
        discardUpload(req);
        return {
          status: false,
          code: 409,
          message:
            'Anda sudah memiliki pengajuan aktif untuk booth dan periode ini',
          data: { application_number: duplicate.applicationNumber },
        };
      }

      const conflict = await this.checkBoothAvailability(
        booth,
        data.start_date,
        data.end_date
      );
      if (conflict) {
        discardUpload(req);
        return conflict;
      }

      const estimatedCost = Number(booth.dailyRate) * duration;
      const proposalUrl = `proposals/${req.file.filename}`;

      const t = await db.sequelize.transaction();
      try {
        let application;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          try {
            application = await RentalApplication.create(
              {
                applicationNumber: generateApplicationNumber(),
                userId: req.user.id,
                boothId: booth.id,
                businessName: data.business_name,
                businessCategory: data.business_category,
                picName: data.pic_name,
                email: data.email,
                phone: data.phone,
                startDate: data.start_date,
                endDate: data.end_date,
                description: data.description || null,
                proposalUrl,
                estimatedCost,
                status: 'DIAJUKAN',
              },
              { transaction: t }
            );
            break;
          } catch (error) {
            if (
              error.name === 'SequelizeUniqueConstraintError' &&
              attempt < 4
            ) {
              continue;
            }
            throw error;
          }
        }

        await ApplicationStatusHistory.create(
          {
            applicationId: application.id,
            oldStatus: null,
            newStatus: 'DIAJUKAN',
            note: 'Pengajuan dibuat',
            changedBy: req.user.id,
          },
          { transaction: t }
        );

        await t.commit();

        return {
          status: true,
          code: 201,
          message: 'Pengajuan berhasil dikirim',
          data: {
            application: {
              id: application.id,
              application_number: application.applicationNumber,
              booth_id: booth.id,
              start_date: application.startDate,
              end_date: application.endDate,
              duration_days: duration,
              estimated_cost: estimatedCost,
              status: application.status,
            },
          },
        };
      } catch (error) {
        await t.rollback();
        discardUpload(req);
        throw error;
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async myList(req) {
    try {
      const schema = Joi.object({
        status: Joi.string().valid(
          'DIAJUKAN',
          'DALAM_PENINJAUAN',
          'PERLU_REVISI',
          'DISETUJUI',
          'DITOLAK',
          'DIBATALKAN'
        ),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
      });

      const validation = helper.validate(req.query, schema);
      if (!validation.status) return validation;

      const { limit, page, offset } = helper.getPagination(req.query);
      const where = { userId: req.user.id };
      if (validation.value.status) where.status = validation.value.status;

      const { count, rows } = await RentalApplication.findAndCountAll({
        where,
        include: [
          {
            model: Booth,
            as: 'booth',
            attributes: ['id', 'code', 'name'],
            include: [{ model: Station, as: 'station', attributes: ['id', 'name'] }],
          },
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

  async myDetail(req) {
    try {
      const validation = helper.validate(
        req.params,
        Joi.object({ id: Joi.number().integer().positive().required() })
      );
      if (!validation.status) return validation;

      const application = await RentalApplication.findOne({
        where: { id: validation.value.id, userId: req.user.id },
        include: [
          {
            model: Booth,
            as: 'booth',
            include: [{ model: Station, as: 'station' }],
          },
          {
            model: ApplicationStatusHistory,
            as: 'statusHistory',
            include: [
              { model: db.User, as: 'changedByUser', attributes: ['id', 'name', 'role'] },
            ],
          },
        ],
        order: [[{ model: ApplicationStatusHistory, as: 'statusHistory' }, 'createdAt', 'ASC']],
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

  async resubmit(req, res) {
    try {
      const paramValidation = helper.validate(
        req.params,
        Joi.object({ id: Joi.number().integer().positive().required() })
      );
      if (!paramValidation.status) {
        discardUpload(req);
        return paramValidation;
      }

      const schema = Joi.object({
        ...businessFields,
        start_date: Joi.date().iso().raw(),
        end_date: Joi.date().iso().raw(),
      }).and('start_date', 'end_date');

      const validation = helper.validate(req.body || {}, schema);
      if (!validation.status) {
        discardUpload(req);
        return validation;
      }

      const data = validation.value;
      if (Object.keys(data).length === 0 && !req.file) {
        discardUpload(req);
        return {
          status: false,
          code: 400,
          message: 'Tidak ada perubahan yang dikirim',
        };
      }

      const application = await RentalApplication.findOne({
        where: { id: paramValidation.value.id, userId: req.user.id },
      });
      if (!application) {
        discardUpload(req);
        return {
          status: false,
          code: 404,
          message: 'Pengajuan tidak ditemukan',
        };
      }
      if (application.status !== 'PERLU_REVISI') {
        discardUpload(req);
        return {
          status: false,
          code: 409,
          message: 'Hanya pengajuan berstatus Perlu Revisi yang dapat dikirim ulang',
        };
      }

      const startDate = data.start_date || application.startDate;
      const endDate = data.end_date || application.endDate;

      const booth = await Booth.findByPk(application.boothId);
      if (!booth || !booth.isActive) {
        discardUpload(req);
        return {
          status: false,
          code: 400,
          message: 'Booth tidak ditemukan atau tidak aktif',
        };
      }

      if (data.start_date) {
        const dateValidation = helper.validate(
          { start_date: startDate, end_date: endDate },
          dateRangeSchema
        );
        if (!dateValidation.status) {
          discardUpload(req);
          return dateValidation;
        }
      }

      const duration = durationDays(startDate, endDate);
      if (duration < booth.minimumDays) {
        discardUpload(req);
        return {
          status: false,
          code: 400,
          message: `Durasi minimum sewa booth ini ${booth.minimumDays} hari`,
        };
      }

      const conflict = await this.checkBoothAvailability(
        booth,
        startDate,
        endDate,
        { excludeApplicationId: application.id }
      );
      if (conflict) {
        discardUpload(req);
        return conflict;
      }

      const t = await db.sequelize.transaction();
      try {
        const oldStatus = application.status;
        const oldProposal = application.proposalUrl;

        const updates = {
          startDate,
          endDate,
          estimatedCost: Number(booth.dailyRate) * duration,
          status: 'DIAJUKAN',
        };
        if (data.business_name !== undefined) updates.businessName = data.business_name;
        if (data.business_category !== undefined) updates.businessCategory = data.business_category;
        if (data.pic_name !== undefined) updates.picName = data.pic_name;
        if (data.email !== undefined) updates.email = data.email;
        if (data.phone !== undefined) updates.phone = data.phone;
        if (data.description !== undefined) updates.description = data.description || null;
        if (req.file) {
          updates.proposalUrl = `proposals/${req.file.filename}`;
        }

        await application.update(updates, { transaction: t });

        await ApplicationStatusHistory.create(
          {
            applicationId: application.id,
            oldStatus,
            newStatus: 'DIAJUKAN',
            note: 'Pengajuan dikirim ulang setelah revisi',
            changedBy: req.user.id,
          },
          { transaction: t }
        );

        await t.commit();

        if (req.file && oldProposal) {
          removeStoredFile(oldProposal);
        }

        return {
          status: true,
          message: 'Pengajuan berhasil dikirim ulang',
          data: { application },
        };
      } catch (error) {
        await t.rollback();
        discardUpload(req);
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

      const application = await RentalApplication.findOne({
        where: { id: validation.value.id, userId: req.user.id },
      });
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

export default new ApplicationModule();