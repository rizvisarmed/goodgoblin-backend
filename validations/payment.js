const joi = require("joi");

const createCheckoutSessionSchema = joi.object({
  priceId: joi.string().required(),
  quantity: joi.number().integer().required(),
  redirectUrl: joi.string().allow(null, ""),
});

module.exports = {
  createCheckoutSessionSchema,
};
