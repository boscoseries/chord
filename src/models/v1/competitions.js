/* eslint-disable camelcase */
const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');
const { Post } = require('../../models/v1/posts');

const Competitions = sequelize.define(
  'competition',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    adbanner_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM('draft', 'published', 'closed'),
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    criteria: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    competition_type: {
      type: Sequelize.ENUM('paid', 'free'),
    },
    fee: {
      type: Sequelize.DOUBLE,
      allowNull: true,
    },
    alerted: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    update_interval: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 4,
    },
    submission_start_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    submission_end_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    vote_start_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    vote_end_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  { underscored: true },
);

const Competition_Criterias = sequelize.define(
  'competition_criteria',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    stages: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { underscored: true },
);

const Competition_Banners = sequelize.define(
  'competition_banner',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    banner_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  { underscored: true },
);

const Competition_Posts = sequelize.define(
  'competition_post',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    competition_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    post_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  { underscored: true },
);

const Competition_Videos = sequelize.define(
  'competition_video',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    video_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  { underscored: true },
);

const Competition_Votes = sequelize.define(
  'competition_vote',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    vote: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  { underscored: true },
);

const Competition_Judges = sequelize.define(
  'competition_judge',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  { underscored: true },
);
const Competition_Subscriptions = sequelize.define(
  'competition_subscription',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    competition_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    subscribed: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  },
  { underscored: true },
);

Competitions.hasOne(Competition_Videos, { foreignKey: 'competition_id' });

Competitions.hasMany(Competition_Posts, { foreignKey: 'competition_id' });

Competitions.hasMany(Competition_Criterias, { foreignKey: 'competition_id' });

Competitions.hasMany(Competition_Banners, { foreignKey: 'competition_id' });

Competitions.hasMany(Competition_Posts, { foreignKey: 'competition_id' });

Competitions.hasMany(Competition_Votes, { foreignKey: 'competition_id' });

Competitions.hasMany(Competition_Judges, { foreignKey: 'competition_id' });

Competitions.hasMany(Competition_Subscriptions, { foreignKey: 'competition_id' });

Competition_Posts.belongsTo(Post, {
  foreignKey: 'post_id',
});

Post.hasMany(Competition_Votes, { foreignKey: 'post_id' });

module.exports = {
  Competitions,
  Competition_Criterias,
  Competition_Banners,
  Competition_Posts,
  Competition_Videos,
  Competition_Votes,
  Competition_Judges,
  Competition_Subscriptions,
};
