/* eslint-disable no-undef */
const Sequelize = require('sequelize');
const { sequelize } = require('../../database-config/connection');

const fcmDeviceToken = sequelize.define(
  'device_token_registration',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
      max: 100,
    },
    device_token: {
      type: Sequelize.STRING,
      allowNull: false,
      max: 100,
    },
  },
  { underscored: true },
);

const fcmTopicSubscription = sequelize.define(
  'fcm_topic_subscription',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    device_token: {
      type: Sequelize.STRING,
      allowNull: false,
      max: 100,
    },
    fcm_topic: {
      type: Sequelize.STRING,
      allowNull: false,
      max: 100,
    },
  },
  { underscored: true },
);

const fcmNotificationMessages = sequelize.define(
  'fcm_notification_messages',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
      max: 100,
    },
    notification_message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    notification_type: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  { underscored: true },
);

module.exports = { fcmDeviceToken, fcmTopicSubscription, fcmNotificationMessages };
