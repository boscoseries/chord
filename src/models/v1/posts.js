/* eslint-disable no-undef */
const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');

const { Comment } = require('../../models/v1/comments');
const { Like } = require('../../models/v1/likes');
const PostShares = require('../../models/v1/post_shares');

const Post = sequelize.define(
  'posts',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      max: 100,
    },
    media_url: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    thumbnail_url: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    post_duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    competition_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    deleted: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { underscored: true },
);

const PostBookmarks = sequelize.define(
  'post_bookmarks',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    post_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  { underscored: true },
);

const PostViewCount = sequelize.define(
  'post_view_counts',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    view_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    view_time: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    post_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    points: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    previous_points: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    gains: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { underscored: true },
);

Post.hasMany(Comment, { foreignKey: 'post_id' });
Post.hasMany(Like, { foreignKey: 'post_id' });
Post.hasMany(PostBookmarks, { foreignKey: 'post_id' });
Post.hasMany(PostShares, { foreignKey: 'post_id' });

module.exports = { Post, PostBookmarks, PostViewCount };
