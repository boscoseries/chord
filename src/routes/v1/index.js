const router = require('express').Router();
const userRouter = require('./api/users');
const postRouter = require('./api/posts');
const commentRouter = require('./api/comments');
const notificationRouter = require('./api/notifications');
const competitionRouter = require('./api/competitions');
const hashtagRouter = require('./api/hashtags');
const paymentRouter = require('./api/payments');
const categoryRouter = require('./api/categories');
const legalRouter = require('./api/legal');

router.use('/api/v1/users', userRouter);
router.use('/api/v1/posts', postRouter);
router.use('/api/v1/comments', commentRouter);
router.use('/api/v1/notifications', notificationRouter);
router.use('/api/v1/competitions', competitionRouter);
router.use('/api/v1/payment', paymentRouter);
router.use('/api/v1/categories', categoryRouter);
router.use('/api/v1/hashtags', hashtagRouter);
router.use('/api/v1/legal', legalRouter);

module.exports = router;
