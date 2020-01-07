const express = require('express');
const commentController = require('../../../controllers/v1/comments');
const authMiddleware = require('../../../middleware/authentication');

const router = express.Router();

router.get('/', authMiddleware, commentController.get);
router.post('/', authMiddleware, commentController.create);
module.exports = router;
