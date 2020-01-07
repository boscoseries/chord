const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');

const UserDetails = sequelize.define(
  'user_details',
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    phone_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    height: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    date_of_birth: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    eye_color: Sequelize.STRING,
    skin_color: Sequelize.STRING,
    biography: {
      type: Sequelize.TEXT,
      max: 300,
      allowNull: true,
    },
    website: Sequelize.STRING,
    address: Sequelize.STRING,
  },
  { underscored: true },
);

module.exports = UserDetails;
