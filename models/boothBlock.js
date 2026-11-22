'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BoothBlock extends Model {
    static associate(models) {
      BoothBlock.belongsTo(models.Booth, {
        foreignKey: 'boothId',
        as: 'booth',
      });
    }
  }

  BoothBlock.init(
    {
      boothId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'BoothBlock',
      tableName: 'booth_blocks',
      underscored: true,
      timestamps: false,
    }
  );

  return BoothBlock;
};