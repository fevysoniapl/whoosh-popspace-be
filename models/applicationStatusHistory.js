'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ApplicationStatusHistory extends Model {
    static associate(models) {
      ApplicationStatusHistory.belongsTo(models.RentalApplication, {
        foreignKey: 'applicationId',
        as: 'application',
      });
      ApplicationStatusHistory.belongsTo(models.User, {
        foreignKey: 'changedBy',
        as: 'changedByUser',
      });
    }
  }

  ApplicationStatusHistory.init(
    {
      applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      oldStatus: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      newStatus: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      changedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ApplicationStatusHistory',
      tableName: 'application_status_history',
      underscored: true,
      updatedAt: false,
    }
  );

  return ApplicationStatusHistory;
};