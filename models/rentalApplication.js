'use strict';

const { Model } = require('sequelize');

const APPLICATION_STATUSES = [
  'DIAJUKAN',
  'DALAM_PENINJAUAN',
  'PERLU_REVISI',
  'DISETUJUI',
  'DITOLAK',
  'DIBATALKAN',
];

module.exports = (sequelize, DataTypes) => {
  class RentalApplication extends Model {
    static associate(models) {
      RentalApplication.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      RentalApplication.belongsTo(models.Booth, {
        foreignKey: 'boothId',
        as: 'booth',
      });
      RentalApplication.hasMany(models.ApplicationStatusHistory, {
        foreignKey: 'applicationId',
        as: 'statusHistory',
      });
    }
  }

  RentalApplication.init(
    {
      applicationNumber: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      boothId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      businessName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      businessCategory: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      picName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING(30),
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      proposalUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      estimatedCost: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...APPLICATION_STATUSES),
        allowNull: false,
        defaultValue: 'DIAJUKAN',
      },
      adminNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'RentalApplication',
      tableName: 'rental_applications',
      underscored: true,
      createdAt: 'submittedAt',
      updatedAt: 'updatedAt',
    }
  );

  return RentalApplication;
};