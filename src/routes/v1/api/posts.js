const express = require('express');
const postController = require('../../../controllers/v1/posts');
const authMiddleware = require('../../../middleware/authentication');

const router = express.Router();
router.get('/newsfeed/personalized', postController.personalizedNewsfeeds);
router.get('/newsfeed', postController.newsfeeds);
router.post('/newpost', authMiddleware, postController.newPost);
router.get('/bookmarks', authMiddleware, postController.getBookmarks);
router.post('/likes', authMiddleware, postController.likes);
router.post('/:id/bookmarks', authMiddleware, postController.newBookmark);
router.post('/:id/points', postController.createPostViewCount);
router.post('/:id/shares', postController.shares);
router.delete('/:id', postController.delete);
router.get('/:id', postController.getOne);

module.exports = router;
