'use strict';

const BLOCK_REASON = 'Pemeliharaan area komersial (simulasi)';

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const [booth] = await queryInterface.sequelize.query(
      `SELECT b.id FROM booths b
       JOIN stations s ON s.id = b.station_id
       WHERE s.name = 'Halim' AND b.code = 'B02'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (!booth) return;

    const today = new Date();
    await queryInterface.bulkInsert('booth_blocks', [
      {
        booth_id: booth.id,
        start_date: addDays(today, 10),
        end_date: addDays(today, 12),
        reason: BLOCK_REASON,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('booth_blocks', { reason: BLOCK_REASON });
  },
};