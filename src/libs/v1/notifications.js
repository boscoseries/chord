const debug = require('debug');
const { fcmDeviceToken } = require('../../models/v1/notifications');
const generatePushID = require('../../util/pushid');
const libHelper = require('../../util/library_helper');

const log = debug('http:notification');

const { fcmNotificationMessages } = require('../../models/v1/notifications');

const notificationLibrary = {};

notificationLibrary.registerNewFCMToken = async (userId, deviceToken) => {
  fcmDeviceToken.destroy({
    where: {
      user_id: userId,
    },
  });

  const newfcmtoken = {
    id: generatePushID(),
    user_id: userId,
    device_token: deviceToken,
  };
  
  fcmDeviceToken.create(newfcmtoken).then(fcmtoken => fcmtoken);
  return deviceToken;
};

notificationLibrary.getUserNotifications = async (req, res) => {
  const userId = req.headers.user_id;
  fcmNotificationMessages
    .findAll({ where: { user_id: userId }, order: [['created_at', 'DESC']] })
    .then((notifications) => {
      res.status(200).json(notifications);
    });
};

notificationLibrary.sendFCMNotification = async (notificationObject) => {
  const message = {
    data: notificationObject.data,
    notification: {
      title: notificationObject.title,
      body: notificationObject.message_body,
    },
    token: notificationObject.token,
    receiverId: notificationObject.receiverId,
  };
  libHelper.sendFCMNotification(message, notificationObject.notification_type);
};

notificationLibrary.sendMultipleFCMNotification = async (notificationObject, tokens) => {
  const message = {
    data: notificationObject.data,
    notification: {
      title: notificationObject.title,
      body: notificationObject.message_body,
    },
  };

  libHelper.sendFCMNotification(message, tokens);
};
module.exports = notificationLibrary;
