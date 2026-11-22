require('dotenv').config({ quiet: true });

const connection = {
  dialect: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

module.exports = {
  development: { ...connection, database: process.env.DB_NAME },
  test: { ...connection, database: process.env.DB_TEST_NAME },
  production: { ...connection, database: process.env.DB_NAME },
};
