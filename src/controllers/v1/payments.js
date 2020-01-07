const paymentLibrary = require('../../libs/v1/payments');

const payment = {};

payment.getPaystackKeys = async (req, res) => {
  const keys = await paymentLibrary.getPaystackKeys();
  if (keys) {
    return res.status(200).json(keys);
  }
  return res.status(500);
};

payment.verifyPayment = async (req, res) => {
  const { reference } = req.query;
  const  userId  = req.headers.user_id;
  const result = await paymentLibrary.verifyPaymentReference(reference, userId);
  if (result) {
    return res.status(200).json({ gateway_response: result });
  }
  return res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = payment;
