'use strict';

const APPLICATION_STATUSES = [
  'DIAJUKAN',
  'DALAM_PENINJAUAN',
  'PERLU_REVISI',
  'DISETUJUI',
  'DITOLAK',
  'DIBATALKAN',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rental_applications', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      application_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      booth_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'booths', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      business_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      business_category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      pic_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      proposal_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      estimated_cost: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(...APPLICATION_STATUSES),
        allowNull: false,
        defaultValue: 'DIAJUKAN',
      },
      admin_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('rental_applications', ['user_id'], {
      name: 'rental_applications_user_id_idx',
    });
    await queryInterface.addIndex('rental_applications', ['booth_id'], {
      name: 'rental_applications_booth_id_idx',
    });
    await queryInterface.addIndex('rental_applications', ['status'], {
      name: 'rental_applications_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rental_applications');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_rental_applications_status";'
    );
  },
};