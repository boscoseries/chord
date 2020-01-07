const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const debug = require('debug');
const { sequelize } = require('../../database-config/connection');

const config = require('../../config/config');
const UserDetail = require('../../models/v1/user-details');
const { Comment } = require('../../models/v1/comments');
const Competitions = require('../../models/v1/competitions');
const likeObj = require('../../models/v1/likes');
const { Post } = require('../../models/v1/posts');
const PostShares = require('../../models/v1/post_shares');
const Follow = require('../../models/v1/follows');
const TokenAuth = require('../../models/v1/token_auth');
const PremiumUser = require('../../models/v1/payments');

const log = debug('http:userModel');

const User = sequelize.define(
  'users',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: true,
      primaryKey: true,
    },
    auth_id: {
      type: Sequelize.STRING,
    },
    auth_type: {
      type: Sequelize.ENUM('phone', 'email', 'facebook', 'google'),
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true,
    },
    fullname: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    role_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    token: {
      type: Sequelize.STRING,
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
  {
    underscored: true,
  },
);

User.hasOne(UserDetail, { foreignKey: 'user_id' });
User.hasOne(PremiumUser, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
User.hasMany(likeObj.Like, { foreignKey: 'user_id' });
User.hasOne(TokenAuth, { foreignKey: 'user_id' });
User.hasMany(Post, { foreignKey: 'user_id' });
User.hasMany(PostShares, { foreignKey: 'user_id' });
User.hasMany(Competitions.Competition_Judges, { foreignKey: 'user_id' });
User.hasMany(Competitions.Competition_Subscriptions, { foreignKey: 'user_id' });
User.hasMany(Competitions.Competitions, { foreignKey: 'owner_id' });
User.hasMany(Competitions.Competition_Votes, { foreignKey: 'user_id' });

User.hasMany(Follow, {
  foreignKey: 'user_id',
});

User.hasMany(Follow, {
  foreignKey: 'follower_id',
});

User.generateAuthToken = (payload) => {
  const token = jwt.sign(
    {
      id: payload.id,
      auth_id: payload.auth_id,
      role_id: payload.role_id,
    },
    config.hashingSecret,
  );
  return token;
};

User.findByLogin = async (authId) => {
  let user = await User.findOne({
    where: { auth_id: authId },
  });

  if (!user) {
    user = await User.findOne({
      where: { username: authId },
    });
  }

  if (!user) {
    user = await User.findOne({
      where: { id: authId },
    });
  }

  return user;
};

function validateUser(user) {
  const Schema = {
    id: Joi.string(),
    auth_id: Joi.string(),
    auth_type: Joi.string(),
    avatar: Joi.string(),
    username: Joi.string(),
    fullname: Joi.string(),
    password: Joi.string(),
    role_id: Joi.string(),
    email: Joi.string(),
    phone_number: Joi.string(),
    gender: Joi.string().allow(''),
    height: Joi.number(),
    date_of_birth: Joi.date().allow(null),
    eye_colour: Joi.string(),
    skin_colour: Joi.string(),
    biography: Joi.string().allow(''),
    website: Joi.string().allow(''),
    address: Joi.string().allow(''),
  };

  return Joi.validate(user, Schema);
}
module.exports = { User, validateUser, PremiumUser };
