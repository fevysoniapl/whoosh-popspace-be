'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booth_blocks', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      booth_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'booths', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    });

    await queryInterface.addIndex('booth_blocks', ['booth_id'], {
      name: 'booth_blocks_booth_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('booth_blocks');
  },
};