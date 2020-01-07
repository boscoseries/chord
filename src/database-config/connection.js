const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];


const sequelize = new Sequelize(config.url, {
  dialect: 'postgres',
});

const { Op } = Sequelize;
module.exports = { sequelize, Op };
