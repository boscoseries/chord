const express = require('express');
const paymentController = require('../../../controllers/v1/payments');
const authMiddleware = require('../../../middleware/authentication');

const router = express.Router();

router.get('/', authMiddleware, paymentController.verifyPayment);
router.get('/paymentkeys', authMiddleware, paymentController.getPaystackKeys);
module.exports = router;
