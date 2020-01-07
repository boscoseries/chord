/* eslint-disable no-undef */
const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');
const { Post } = require('../../models/v1/posts');

const Category = sequelize.define(
  'category',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      max: 100,
    },
  },
  { underscored: true },
);

Category.hasMany(Post, { foreignKey: 'category_id' });

module.exports = Category;
