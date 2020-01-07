const redis = require('redis');
const debug = require('debug');

const log = debug('http:cache');

const client = redis.createClient(16379);

client.on('connect', () => log('Redis connected'));
client.on('error', error => log(`Something went wrong ${error}`));

const cache = (req, res, next) => {
  const key = req.originalUrl;

  client.get(key, (err, response) => {
    if (err === null && response !== null) {
      log(`Get cache - ${response}`);
      return res.json(JSON.parse(response));
    }
    return next();
  });
};

const setCache = (key, data) => {
  client.set(key, JSON.stringify(data), (error, response) => {
    if (error === null && response === 'OK') {
      log(`set cache ${response} error ${error}`);
    }
  });
};

module.exports = { cache, setCache };
