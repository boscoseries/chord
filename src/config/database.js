const development = {
  url: process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/maudition_staging',
  dialect: 'postgres',
};

const production = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres',
};

const test = {
  url: process.env.DATABASE_TEST || 'postgres://postgres@localhost:5432/maudition_db_test',
  dialect: 'postgres',
};

const config = {
  development,
  production,
  staging: production,
  test,
};

module.exports = config;
