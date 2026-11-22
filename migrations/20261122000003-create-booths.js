'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booths', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      station_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'stations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      area: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      size_sqm: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
      },
      daily_rate: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      minimum_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      has_electricity: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      facilities: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'[]'::jsonb"),
      },
      map_x: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
      },
      map_y: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    });

    await queryInterface.addIndex('booths', ['station_id', 'code'], {
      unique: true,
      name: 'booths_station_id_code_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('booths');
  },
};