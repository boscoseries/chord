/* eslint-disable no-undef */
const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');

const TokenAuth = sequelize.define(
  'token_auths',
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    auth_id: {
      type: Sequelize.STRING,
    },
    auth_type: {
      type: Sequelize.ENUM('email', 'phone'),
    },
    otp_token: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.INTEGER,
    },
  },
  { underscored: true },
);

module.exports = TokenAuth;
