'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booth extends Model {
    static associate(models) {
      Booth.belongsTo(models.Station, {
        foreignKey: 'stationId',
        as: 'station',
      });
      Booth.hasMany(models.BoothBlock, {
        foreignKey: 'boothId',
        as: 'blocks',
      });
      Booth.hasMany(models.RentalApplication, {
        foreignKey: 'boothId',
        as: 'applications',
      });
    }
  }

  Booth.init(
    {
      stationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      area: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      sizeSqm: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
      },
      dailyRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      minimumDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      hasElectricity: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      facilities: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      mapX: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
      },
      mapY: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Booth',
      tableName: 'booths',
      underscored: true,
      timestamps: false,
    }
  );

  return Booth;
};