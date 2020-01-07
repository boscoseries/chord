const Joi = require('@hapi/joi');

const schema = Joi.object({
  user_id: Joi.string().required(),
  competition_id: Joi.string().required(),
});

module.exports = schema;
