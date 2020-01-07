const express = require('express');
const { profileImage } = require('../../../config/s3_config');
const userController = require('../../../controllers/v1/users');
const authMiddleware = require('../../../middleware/authentication');
const adminAuth = require('../../../middleware/admin');

const router = express.Router();

router.get('/', [authMiddleware, adminAuth], userController.get);
router.put('/:id/change_password', authMiddleware, userController.changePassword);
router.post('/otp', userController.generateOTP);
router.post('/otp_validation', userController.validateOTP);
router.post('/password_otp_validation', userController.validateAllOTP);
router.post('/forgot_password', userController.forgotPassword);
router.put('/reset_password', userController.resetPassword);

router.post('/signin', userController.signIn);
router.post('/signup', userController.signUpByAuthPassword);
router.post('/:id/signout', userController.signOut);
router.get('/search', userController.search);
router.get('/search/advanced', userController.searchAdvanced);
router.get('/me', authMiddleware, userController.getCurrentUser);
router.get('/:id', userController.getUser);
router.put('/:id', authMiddleware, userController.updateProfile);
router.put('/:id/role', [authMiddleware, adminAuth], userController.updateRole);
router.get('/:id/followers', authMiddleware, userController.followers);
router.get('/:id/following', userController.following);
router.put(
  '/:id/updateAvatar',
  [authMiddleware, profileImage.single('profileImage')],
  userController.updateAvatar,
);
router.post('/social-media', userController.authBySocialMedia);
router.post('/follows', authMiddleware, userController.follow);
router.get('/:id/liked', authMiddleware, userController.liked);
module.exports = router;
