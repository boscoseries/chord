const notificationLibrary = require('../../libs/v1/notifications');

const notification = {};

notification.registerFCMToken = async (req, res) => {
  const userId = req.headers.user_id;
  const deviceToken = req.headers.fcm_token;
  await notificationLibrary.registerNewFCMToken(userId, deviceToken);
};

notification.getUserNotifications = async (req, res) => {
  await notificationLibrary.getUserNotifications(req, res);
};
module.exports = notification;
