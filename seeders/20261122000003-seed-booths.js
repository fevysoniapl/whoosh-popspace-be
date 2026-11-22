'use strict';

const STATION_NAMES = ['Halim', 'Padalarang'];

const BOOTH_LAYOUT = [
  { code: 'B01', mapX: 120, mapY: 110 },
  { code: 'B02', mapX: 360, mapY: 110 },
  { code: 'B03', mapX: 600, mapY: 110 },
  { code: 'B04', mapX: 120, mapY: 280 },
  { code: 'B05', mapX: 360, mapY: 280 },
  { code: 'B06', mapX: 600, mapY: 280 },
];

function buildBooths(stationId, stationName) {
  const slug = stationName.toLowerCase();
  const specs = [
    {
      category: 'F&B',
      area: 'Zona A — Selasar Keberangkatan',
      sizeSqm: 6,
      dailyRate: 350000,
      minimumDays: 3,
      hasElectricity: true,
      facilities: ['Listrik 220V', 'Meja display', 'Kursi'],
      isActive: true,
    },
    {
      category: 'F&B',
      area: 'Zona A — Selasar Keberangkatan',
      sizeSqm: 4,
      dailyRate: 250000,
      minimumDays: 3,
      hasElectricity: true,
      facilities: ['Listrik 220V', 'Meja display'],
      isActive: true,
    },
    {
      category: 'Retail',
      area: 'Zona B — Area Komersial Utama',
      sizeSqm: 8,
      dailyRate: 400000,
      minimumDays: 7,
      hasElectricity: true,
      facilities: ['Listrik 220V', 'Rak display', 'Kursi', 'Pencahayaan'],
      isActive: true,
    },
    {
      category: 'Merchandise',
      area: 'Zona B — Area Komersial Utama',
      sizeSqm: 4,
      dailyRate: 200000,
      minimumDays: 3,
      hasElectricity: false,
      facilities: ['Meja display', 'Kursi'],
      isActive: true,
    },
    {
      category: 'Promosi',
      area: 'Zona C — Plaza Pop-Up',
      sizeSqm: 12,
      dailyRate: 500000,
      minimumDays: 1,
      hasElectricity: true,
      facilities: ['Listrik 220V', 'Pencahayaan', 'Area terbuka'],
      isActive: true,
    },
    {
      category: 'Retail',
      area: 'Zona C — Plaza Pop-Up',
      sizeSqm: 6,
      dailyRate: 300000,
      minimumDays: 7,
      hasElectricity: false,
      facilities: ['Meja display'],
      isActive: false,
    },
  ];

  return BOOTH_LAYOUT.map((layout, index) => {
    const spec = specs[index];
    return {
      station_id: stationId,
      code: layout.code,
      name: `Booth ${stationName} ${layout.code}`,
      area: spec.area,
      category: spec.category,
      size_sqm: spec.sizeSqm,
      daily_rate: spec.dailyRate,
      minimum_days: spec.minimumDays,
      description: `Booth pop-up ${spec.category} ukuran ${spec.sizeSqm} m2 di Stasiun ${stationName} (data simulasi).`,
      image_url: `/images/booths/${slug}-${layout.code.toLowerCase()}.jpg`,
      has_electricity: spec.hasElectricity,
      facilities: JSON.stringify(spec.facilities),
      map_x: layout.mapX,
      map_y: layout.mapY,
      is_active: spec.isActive,
    };
  });
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const stations = await queryInterface.sequelize.query(
      'SELECT id, name FROM stations WHERE name IN (:names)',
      {
        replacements: { names: STATION_NAMES },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const rows = stations.flatMap((station) =>
      buildBooths(station.id, station.name)
    );
    await queryInterface.bulkInsert('booths', rows);
  },

  async down(queryInterface, Sequelize) {
    const stations = await queryInterface.sequelize.query(
      'SELECT id FROM stations WHERE name IN (:names)',
      {
        replacements: { names: STATION_NAMES },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    await queryInterface.bulkDelete('booths', {
      station_id: { [Sequelize.Op.in]: stations.map((s) => s.id) },
      code: { [Sequelize.Op.in]: BOOTH_LAYOUT.map((b) => b.code) },
    });
  },
};