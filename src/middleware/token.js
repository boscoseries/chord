const debug = require('debug');
const { sequelize } = require('../database-config/connection');

const log = debug('http:blacklisted');

const blacklistedToken = (request, response, next) => {
  log(request.token);
  const query = `SELECT * FROM blacklisted_tokens WHERE token='${request.token}'`;

  const token = sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  log(token);

  if (token[0]) {
    response.status(403).send({ error: 'Unauthorized login' });
  }

  next();
};

export default blacklistedToken;
