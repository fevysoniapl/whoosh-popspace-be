import fs from 'node:fs';
import path from 'node:path';
import { Op } from 'sequelize';
import Joi from 'joi';
import db from '../../models/index.js';
import helper from '../../class/helper.class.js';
import BaseModule from '../../class/base.module.js';
import { discardUpload } from '../../class/upload.class.js';

const { Booth, BoothBlock, Station } = db;

const BOOTH_IMAGE_DIR = path.resolve('public/uploads/booths');

const facilitiesSchema = Joi.custom((value, helpers) => {
  let arr = value;
  if (typeof value === 'string') {
    try {
      arr = JSON.parse(value);
    } catch {
      return helpers.error('any.invalid');
    }
  }
  if (
    !Array.isArray(arr) ||
    arr.some((item) => typeof item !== 'string' || !item.trim())
  ) {
    return helpers.error('any.invalid');
  }
  return arr.map((item) => item.trim());
}, 'facilities').messages({
  'any.invalid': 'facilities harus berupa array of string',
});

const boothFields = {
  station_id: Joi.number().integer().positive(),
  code: Joi.string().trim().uppercase().max(20),
  name: Joi.string().trim().max(100),
  area: Joi.string().trim().max(100).allow('', null),
  category: Joi.string().trim().max(50).allow('', null),
  size_sqm: Joi.number().positive().precision(2),
  daily_rate: Joi.number().positive().precision(2),
  minimum_days: Joi.number().integer().min(1),
  description: Joi.string().trim().allow('', null),
  has_electricity: Joi.boolean(),
  facilities: facilitiesSchema,
  map_x: Joi.number().precision(2),
  map_y: Joi.number().precision(2),
  is_active: Joi.boolean(),
};

function removeOldImage(imageUrl) {
  if (imageUrl && imageUrl.startsWith('/uploads/booths/')) {
    const filename = path.basename(imageUrl);
    fs.promises.unlink(path.join(BOOTH_IMAGE_DIR, filename)).catch(() => {});
  }
}

class AdminBoothModule extends BaseModule {
  async list(req) {
    try {
      const schema = Joi.object({
        station_id: Joi.number().integer().positive(),
        category: Joi.string().trim().max(50),
        is_active: Joi.boolean(),
        search: Joi.string().trim().max(100),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
      });

      const validation = helper.validate(req.query, schema);
      if (!validation.status) return validation;

      const { station_id, category, is_active, search } = validation.value;
      const { limit, page, offset } = helper.getPagination(req.query);

      const where = {};
      if (station_id !== undefined) where.stationId = station_id;
      if (category !== undefined) where.category = category;
      if (is_active !== undefined) where.isActive = is_active;
      if (search) {
        where[Op.or] = [
          { code: { [Op.iLike]: `%${search}%` } },
          { name: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Booth.findAndCountAll({
        where,
        include: [{ model: Station, as: 'station', attributes: ['id', 'name'] }],
        order: [
          ['stationId', 'ASC'],
          ['code', 'ASC'],
        ],
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

  async add(req, res) {
    try {
      const schema = Joi.object({
        ...boothFields,
        station_id: boothFields.station_id.required(),
        code: boothFields.code.required(),
        name: boothFields.name.required(),
        daily_rate: boothFields.daily_rate.required(),
        minimum_days: boothFields.minimum_days.default(1),
        has_electricity: boothFields.has_electricity.default(false),
        facilities: facilitiesSchema.default([]),
        is_active: boothFields.is_active.default(true),
      });

      const validation = helper.validate(req.body, schema);
      if (!validation.status) {
        discardUpload(req);
        return validation;
      }

      const data = validation.value;

      const station = await Station.findByPk(data.station_id);
      if (!station) {
        discardUpload(req);
        return { status: false, code: 404, message: 'Stasiun tidak ditemukan' };
      }

      const existing = await Booth.findOne({
        where: { stationId: data.station_id, code: data.code },
      });
      if (existing) {
        discardUpload(req);
        return {
          status: false,
          code: 409,
          message: `Kode booth ${data.code} sudah ada di stasiun ini`,
        };
      }

      const booth = await Booth.create({
        stationId: data.station_id,
        code: data.code,
        name: data.name,
        area: data.area || null,
        category: data.category || null,
        sizeSqm: data.size_sqm ?? null,
        dailyRate: data.daily_rate,
        minimumDays: data.minimum_days,
        description: data.description || null,
        imageUrl: req.file ? `/uploads/booths/${req.file.filename}` : null,
        hasElectricity: data.has_electricity,
        facilities: data.facilities,
        mapX: data.map_x ?? null,
        mapY: data.map_y ?? null,
        isActive: data.is_active,
      });

      return {
        status: true,
        code: 201,
        message: 'Booth berhasil ditambahkan',
        data: { booth },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(req, res) {
    try {
      const paramValidation = helper.validate(
        req.params,
        Joi.object({ id: Joi.number().integer().positive().required() })
      );
      if (!paramValidation.status) {
        discardUpload(req);
        return paramValidation;
      }

      const schema = Joi.object(boothFields);
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

      const booth = await Booth.findByPk(paramValidation.value.id);
      if (!booth) {
        discardUpload(req);
        return { status: false, code: 404, message: 'Booth tidak ditemukan' };
      }

      if (data.station_id !== undefined) {
        const station = await Station.findByPk(data.station_id);
        if (!station) {
          discardUpload(req);
          return {
            status: false,
            code: 404,
            message: 'Stasiun tidak ditemukan',
          };
        }
      }

      const newStationId = data.station_id ?? booth.stationId;
      const newCode = data.code ?? booth.code;
      if (newStationId !== booth.stationId || newCode !== booth.code) {
        const existing = await Booth.findOne({
          where: {
            stationId: newStationId,
            code: newCode,
            id: { [Op.ne]: booth.id },
          },
        });
        if (existing) {
          discardUpload(req);
          return {
            status: false,
            code: 409,
            message: `Kode booth ${newCode} sudah ada di stasiun ini`,
          };
        }
      }

      const updates = {};
      if (data.station_id !== undefined) updates.stationId = data.station_id;
      if (data.code !== undefined) updates.code = data.code;
      if (data.name !== undefined) updates.name = data.name;
      if (data.area !== undefined) updates.area = data.area || null;
      if (data.category !== undefined) updates.category = data.category || null;
      if (data.size_sqm !== undefined) updates.sizeSqm = data.size_sqm;
      if (data.daily_rate !== undefined) updates.dailyRate = data.daily_rate;
      if (data.minimum_days !== undefined) updates.minimumDays = data.minimum_days;
      if (data.description !== undefined) updates.description = data.description || null;
      if (data.has_electricity !== undefined) updates.hasElectricity = data.has_electricity;
      if (data.facilities !== undefined) updates.facilities = data.facilities;
      if (data.map_x !== undefined) updates.mapX = data.map_x;
      if (data.map_y !== undefined) updates.mapY = data.map_y;
      if (data.is_active !== undefined) updates.isActive = data.is_active;
      if (req.file) {
        updates.imageUrl = `/uploads/booths/${req.file.filename}`;
      }

      const oldImage = booth.imageUrl;
      await booth.update(updates);

      if (req.file) {
        removeOldImage(oldImage);
      }

      return {
        status: true,
        message: 'Booth berhasil diperbarui',
        data: { booth },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addBlock(req) {
    try {
      const paramValidation = helper.validate(
        req.params,
        Joi.object({ id: Joi.number().integer().positive().required() })
      );
      if (!paramValidation.status) return paramValidation;

      const schema = Joi.object({
        start_date: Joi.date().iso().raw().required(),
        end_date: Joi.date().iso().raw().min(Joi.ref('start_date')).required(),
        reason: Joi.string().trim().max(255).allow('', null),
      }).custom((value, helpers) => {
        if (value.start_date < helper.today()) {
          return helpers.message({
            custom: 'start_date tidak boleh tanggal lampau',
          });
        }
        return value;
      });

      const validation = helper.validate(req.body, schema);
      if (!validation.status) return validation;

      const booth = await Booth.findByPk(paramValidation.value.id);
      if (!booth) {
        return { status: false, code: 404, message: 'Booth tidak ditemukan' };
      }

      const block = await BoothBlock.create({
        boothId: booth.id,
        startDate: validation.value.start_date,
        endDate: validation.value.end_date,
        reason: validation.value.reason || null,
      });

      return {
        status: true,
        code: 201,
        message: 'Tanggal berhasil diblokir',
        data: { block },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new AdminBoothModule();