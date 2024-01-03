const joi = require("joi");

const { createQuestionSchema } = require("./question");

const createSectionSchema = joi.object({
  sectionName: joi.string().required(),
  sectionSubTitle: joi.string().required(),
  isRequired: joi.boolean().required(),
  interviewQuestions: joi.array().items(createQuestionSchema),
});

module.exports = {
  createSectionSchema,
};
