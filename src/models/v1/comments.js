/* eslint-disable no-undef */
const Sequelize = require('sequelize');
const Joi = require('joi');
const { sequelize } = require('../../database-config/connection');

const Comment = sequelize.define(
  'comments',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  { underscored: true },
);

function validateComment(comment) {
  const Schema = {
    id: Joi.string(),
    comment: Joi.string(),
    post_id: Joi.string(),
    user_id: Joi.string(),
  };

  return Joi.validate(comment, Schema);
}

module.exports = { Comment, validateComment };
