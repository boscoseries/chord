const express = require('express');
const hashtagController = require('../../../controllers/v1/hashtags');
const authMiddleware = require('../../../middleware/authentication');


const router = express.Router();

router.get('/posts', hashtagController.getAllHashtags);
router.post('/', hashtagController.createHashtag);
router.get('/:id/posts', hashtagController.getHashtag);

module.exports = router;
