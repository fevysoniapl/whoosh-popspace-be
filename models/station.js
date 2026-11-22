'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Station extends Model {
    static associate(models) {
      Station.hasMany(models.Booth, {
        foreignKey: 'stationId',
        as: 'booths',
      });
    }
  }

  Station.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mapUrl: {
        type: DataTypes.STRING(255),
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
      modelName: 'Station',
      tableName: 'stations',
      underscored: true,
      timestamps: false,
    }
  );

  return Station;
};