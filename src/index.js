/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
require('dotenv').config('../env');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const debug = require('debug');

const elasticsearch = require('elasticsearch');
const workers = require('./util/worker');
const { sequelize } = require('./database-config/connection');
const options = require('../src/api/swagger-config');
const config = require('./config/config');
const v1 = require('./routes/v1/index');

const log = debug('http:index');

const elastic = require('./config/elasticsearch');
const scheduler = require('./util/schedulers');

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

setInterval(async () => {
  await workers.init();
}, 1000 * 60 * 60);

const specs = swaggerJsdoc(options);
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(v1);
app.use('/search', async (req, res) => {
  const { term, offset } = req.query;
  const result = await elastic.queryTerm(term, offset);
  res.send(result);
});

app.use((err, req, res, next) => {
  console.log('This is the invalid field ->', err.field);
  next(err);
});

app.listen(config.httpPort, () => {
  console.log('Server listening on port %s and %s environment', config.httpPort, config.envName);
});

module.exports = app;
