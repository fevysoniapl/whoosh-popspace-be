'use strict';

const NEW_STATIONS = [
  {
    name: 'Karawang',
    description:
      'Stasiun Karawang (simulasi) — area komersial transit dengan plaza pop-up di selasar utama.',
    map_url: '/maps/karawang.svg',
    is_active: true,
  },
  {
    name: 'Tegalluar Summarecon',
    description:
      'Stasiun Tegalluar Summarecon (simulasi) — area komersial terintegrasi kawasan Summarecon dengan ruang pameran luas.',
    map_url: '/maps/tegalluar-summarecon.svg',
    is_active: true,
  },
];

const STATION_NAMES = NEW_STATIONS.map((s) => s.name);

const BOOTH_LAYOUT = [
  { code: 'B01', mapX: 120, mapY: 110 },
  { code: 'B02', mapX: 360, mapY: 110 },
  { code: 'B03', mapX: 600, mapY: 110 },
  { code: 'B04', mapX: 120, mapY: 280 },
  { code: 'B05', mapX: 360, mapY: 280 },
  { code: 'B06', mapX: 600, mapY: 280 },
];

const BOOTH_SPECS = [
  {
    category: 'F&B',
    area: 'Zona A — Selasar Keberangkatan',
    sizeSqm: 6,
    dailyRate: 300000,
    minimumDays: 3,
    hasElectricity: true,
    facilities: ['Listrik 220V', 'Meja display', 'Kursi'],
    isActive: true,
  },
  {
    category: 'F&B',
    area: 'Zona A — Selasar Keberangkatan',
    sizeSqm: 4,
    dailyRate: 225000,
    minimumDays: 3,
    hasElectricity: true,
    facilities: ['Listrik 220V', 'Meja display'],
    isActive: true,
  },
  {
    category: 'Retail',
    area: 'Zona B — Area Komersial Utama',
    sizeSqm: 8,
    dailyRate: 350000,
    minimumDays: 7,
    hasElectricity: true,
    facilities: ['Listrik 220V', 'Rak display', 'Kursi', 'Pencahayaan'],
    isActive: true,
  },
  {
    category: 'Merchandise',
    area: 'Zona B — Area Komersial Utama',
    sizeSqm: 4,
    dailyRate: 175000,
    minimumDays: 3,
    hasElectricity: false,
    facilities: ['Meja display', 'Kursi'],
    isActive: true,
  },
  {
    category: 'Promosi',
    area: 'Zona C — Plaza Pop-Up',
    sizeSqm: 12,
    dailyRate: 450000,
    minimumDays: 1,
    hasElectricity: true,
    facilities: ['Listrik 220V', 'Pencahayaan', 'Area terbuka'],
    isActive: true,
  },
  {
    category: 'Retail',
    area: 'Zona C — Plaza Pop-Up',
    sizeSqm: 6,
    dailyRate: 275000,
    minimumDays: 7,
    hasElectricity: false,
    facilities: ['Meja display'],
    isActive: true,
  },
];

function stationSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function buildBooth(stationId, stationName, code) {
  const index = BOOTH_LAYOUT.findIndex((b) => b.code === code);
  const layout = BOOTH_LAYOUT[index];
  const spec = BOOTH_SPECS[index];
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
    image_url: `/images/booths/${stationSlug(stationName)}-${layout.code.toLowerCase()}.jpg`,
    has_electricity: spec.hasElectricity,
    facilities: JSON.stringify(spec.facilities),
    map_x: layout.mapX,
    map_y: layout.mapY,
    is_active: spec.isActive,
  };
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const existingStations = await queryInterface.sequelize.query(
      'SELECT id, name FROM stations WHERE name IN (:names)',
      {
        replacements: { names: STATION_NAMES },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const existingNames = new Set(existingStations.map((s) => s.name));

    const missingStations = NEW_STATIONS.filter(
      (s) => !existingNames.has(s.name)
    );
    if (missingStations.length > 0) {
      await queryInterface.bulkInsert('stations', missingStations);
    }

    const stations = await queryInterface.sequelize.query(
      'SELECT id, name FROM stations WHERE name IN (:names)',
      {
        replacements: { names: STATION_NAMES },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    for (const station of stations) {
      const existingBooths = await queryInterface.sequelize.query(
        'SELECT code FROM booths WHERE station_id = :stationId',
        {
          replacements: { stationId: station.id },
          type: Sequelize.QueryTypes.SELECT,
        }
      );
      const existingCodes = new Set(existingBooths.map((b) => b.code));

      const rows = BOOTH_LAYOUT.filter(
        (layout) => !existingCodes.has(layout.code)
      ).map((layout) => buildBooth(station.id, station.name, layout.code));

      if (rows.length > 0) {
        await queryInterface.bulkInsert('booths', rows);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const stations = await queryInterface.sequelize.query(
      'SELECT id FROM stations WHERE name IN (:names)',
      {
        replacements: { names: STATION_NAMES },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const stationIds = stations.map((s) => s.id);

    if (stationIds.length > 0) {
      await queryInterface.bulkDelete('booths', {
        station_id: { [Sequelize.Op.in]: stationIds },
        code: { [Sequelize.Op.in]: BOOTH_LAYOUT.map((b) => b.code) },
      });
    }
    await queryInterface.bulkDelete('stations', {
      name: { [Sequelize.Op.in]: STATION_NAMES },
    });
  },
};