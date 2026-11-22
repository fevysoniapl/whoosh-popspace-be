'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('application_status_history', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rental_applications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      old_status: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      new_status: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('application_status_history', ['application_id'], {
      name: 'application_status_history_application_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('application_status_history');
  },
};