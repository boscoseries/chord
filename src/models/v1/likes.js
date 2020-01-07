const Joi = require('joi');

const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');

const Like = sequelize.define(
  'likes',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      max: 100,
    },
  },
  { underscored: true },
);

function validateLike(like) {
  const Schema = {
    status: Joi.number(),
    post_id: Joi.string(),
    user_id: Joi.string(),
  };

  return Joi.validate(like, Schema);
}

module.exports = { Like, validateLike };
