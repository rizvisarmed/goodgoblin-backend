const joi = require("joi");

const createQuestionSchema = joi.object({
  questionText: joi.string(),
  customData: joi.any(),
  minWordLimit: joi.number().integer().required(),
  maxWordLimit: joi.number().integer().required(),
  isRequired: joi.boolean().required(),
  inputType: joi.string().required(),
  answerType: joi.string().required(),
  promptQuestionBefore: joi.string().allow(null, ""),
  promptQuestionAfter: joi.string().allow(null, ""),
  essayCategoryLetter: joi.string().allow(null, ""),
});

const updateQuestionSchema = joi.object({
  question: joi.string(),
  subQuestions: joi.string().allow(null, ""),
  wordLimit: joi.number().integer(),
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
};
