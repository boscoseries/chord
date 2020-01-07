const config = require('../../config/config');

// eslint-disable-next-line import/order
const paystack = require('paystack')(config.paystackSecretKey);
const { User } = require('../../models/v1/users');
const generatePushID = require('../../util/pushid');
const premiumUserModel = require('../../models/v1/payments');

const paymentLibrary = {};


paymentLibrary.getPaystackKeys = async () => {
  const paystackKeys = {
    secret_key: config.paystackSecretKey,
    public_key: config.paystackPublicKey,
  };

  return paystackKeys;
};

const upgradeUser = async (userid, reference, authorization) => {
  const user = await User.findOne({
    where: {
      id: userid,
    },
  });
  user.role_id = 'scout';
  user.save();

  const premiumUser = {
    id: generatePushID(),
    user_id: userid,
    payment_reference: reference,
    payment_authorization: authorization,
    status: 1,
  };

  premiumUserModel.create(premiumUser);
};

paymentLibrary.verifyPaymentReference = async (reference, userId) => new Promise(((resolve, reject) => {
  paystack.transaction.verify(reference,
    async (error, body) => {
      if (error) {
        return error;
      }
      if (body.data.status === 'success') {
        const auth = body.data.authorization.authorization_code;
        upgradeUser(userId, reference, auth);
        resolve(body.data.gateway_response);
      } else {
        reject('error with payment');
      }
    });
}));

module.exports = paymentLibrary;
