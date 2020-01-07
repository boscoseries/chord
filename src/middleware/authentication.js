const jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');

const config = require('../config/config');

// console.log('secret', config.hashingSecret);
const cryptr = new Cryptr(config.hashingSecret);

const auth = (request, response, next) => {
  const token = request.header('x_auth_token');
  if (!token) {
    // 401 if user is not already logged in
    return response.status(401).json({ message: 'Please login' });
  }

  try {
    const decryptedString = cryptr.decrypt(token);

    // const decrypted = jwt.verify(token, config.hashingSecret);
    const decrypted = jwt.verify(decryptedString, config.hashingSecret);
    request.user = decrypted;
    request.token = token;

    return next();
  } catch (exception) {
    // 400 if token is bad
    return response.status(401).json({ message: exception.message });
  }
};

module.exports = auth;
