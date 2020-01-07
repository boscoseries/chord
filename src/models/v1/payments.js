
const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');


const PremiumUser = sequelize.define(
  'premium_users',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: true,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.STRING,
    },
    payment_reference: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    payment_authorization: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    underscored: true,
  },
);
module.exports = PremiumUser;
