const request = require('supertest');
const { expect } = require('chai');
const app = require('../../index');
const payload = require('../testhelpers/payloadsamples');
const { User } = require('../../models/v1/users');
const { fcmDeviceToken, fcmNotificationMessages } = require('../../models/v1/notifications');

describe('NOTIFICATIONS', () => {
  before(async () => {
    await User.create(payload.signupCredOne);
    //  convert notification message to proper json format...
    payload.notificationMessage.notification_message = JSON.stringify(
      payload.notificationMessage.notification_message,
    );
    //  create notification
    await fcmNotificationMessages.create(payload.notificationMessage);
    await fcmDeviceToken.destroy({
      where: {},
    });
  });

  after(async () => {
    await User.destroy({
      where: {},
    });

    fcmNotificationMessages.destroy({
      where: {},
    });
  });

  describe('GET NOTIFICATION /api/v1/fcmtoken', () => {
    it('should get the notification message', async () => {
      const response = await request(app)
        .get('/api/v1/notifications')
        .set('user_id', payload.signupCredOne.id)
        .set('x_auth_token', payload.token)
        .expect(200);
      expect(response.body[0]).to.haveOwnProperty('id');
      expect(response.body[0]).to.haveOwnProperty('user_id');
      expect(response.body[0]).to.haveOwnProperty('notification_message');
      expect(response.body[0]).to.haveOwnProperty('notification_message');
      expect(response.body[0]).to.haveOwnProperty('notification_type');
    });
  });
});
