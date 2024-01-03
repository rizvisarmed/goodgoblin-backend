const joi = require("joi");

const createUniversitySchema = joi.object({
  name: joi.string().required(),
  numberOfRequiredEssays: joi.number().integer().required(),
  deadlines: joi.array().items(joi.date().iso()),
  state: joi.string().required(),
});

const updateUniversitySchema = joi.object({
  name: joi.string(),
  numberOfRequiredEssays: joi.number().integer(),
});

module.exports = {
  createUniversitySchema,
  updateUniversitySchema,
};
