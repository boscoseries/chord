/* eslint-disable no-undef */
const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');

const Hashtag = sequelize.define(
  'hashtag',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  { underscored: true },
);

const HashtagPosts = sequelize.define(
  'hashtagpost',
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING,
    },
    hashtag_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    post_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { underscored: true },
);

module.exports = { Hashtag, HashtagPosts };
