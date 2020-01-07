
const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');

const Follow = sequelize.define(
  'follow',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  { underscored: true },
);

module.exports = Follow;
