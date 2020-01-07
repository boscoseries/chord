const express = require('express');
const categoryController = require('../../../controllers/v1/categories');
const authMiddleware = require('../../../middleware/authentication');

const router = express.Router();

router.get('/', categoryController.getCategoryList);
router.get('/posts', categoryController.getCategories);
router.get('/:id/posts', categoryController.getOneCategory);
router.post('/', authMiddleware, categoryController.createCategory);

module.exports = router;
