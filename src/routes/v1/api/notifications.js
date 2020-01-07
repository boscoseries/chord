const express = require('express');
const notificationController = require('../../../controllers/v1/notifications');
const authMiddleware = require('../../../middleware/authentication');

const router = express.Router();

router.post('/fcmtoken', notificationController.registerFCMToken);
router.get('/', authMiddleware, notificationController.getUserNotifications);
module.exports = router;
