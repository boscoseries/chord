/* eslint-disable no-undef */
const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');

const PostShares = sequelize.define(
  'post_shares',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    social_media_channel: {
      type: Sequelize.STRING,
      allowNull: false,
      max: 100,
    },
  },
  { underscored: true },
);

module.exports = PostShares;
