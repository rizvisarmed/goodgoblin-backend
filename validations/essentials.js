const joi = require("joi");

const transformEssaySchema = joi.object({
  textSelection: joi.string().required(),
  ask: joi.string().required(),
});

module.exports = {
  transformEssaySchema,
};
