'use strict';

const SEED_STATIONS = ['Halim', 'Padalarang'];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('stations', [
      {
        name: 'Halim',
        description:
          'Stasiun Halim (simulasi) — area komersial keberangkatan dengan lalu lintas penumpang tinggi.',
        map_url: '/maps/halim.svg',
        is_active: true,
      },
      {
        name: 'Padalarang',
        description:
          'Stasiun Padalarang (simulasi) — area komersial konektor feeder dengan ruang pop-up yang luas.',
        map_url: '/maps/padalarang.svg',
        is_active: true,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('stations', {
      name: { [Sequelize.Op.in]: SEED_STATIONS },
    });
  },
};