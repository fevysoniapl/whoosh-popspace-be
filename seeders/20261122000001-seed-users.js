'use strict';

const bcrypt = require('bcryptjs');

const SEED_EMAILS = ['admin@popspace.demo', 'tenant@popspace.demo'];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin KCIC (Simulasi)',
        email: 'admin@popspace.demo',
        password_hash: bcrypt.hashSync('Admin123!', 10),
        phone: '081100000001',
        role: 'ADMIN',
        created_at: now,
      },
      {
        name: 'Kopi Langit (Simulasi)',
        email: 'tenant@popspace.demo',
        password_hash: bcrypt.hashSync('User123!', 10),
        phone: '081100000002',
        role: 'USER',
        created_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: { [Sequelize.Op.in]: SEED_EMAILS },
    });
  },
};