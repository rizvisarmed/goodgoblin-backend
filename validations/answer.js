const joi = require("joi");

const createAnswerForSelectedAdjectivesSchema = joi.object({
  interviewQuestionId: joi.number().integer().positive().required(),
  sectionId: joi.number().integer().positive().required(),
  newTexts: joi.array().items(joi.string()).min(1).required(),
});

const createUpdateAnswerSchema = joi.object({
  id: joi.number().integer().positive(),
  sectionId: joi.number().integer().positive().optional(),
  interviewQuestionId: joi.number().integer().positive(),
  answerText: joi.string(),
  customAnswer: joi.any(),
});

module.exports = {
  createUpdateAnswerSchema,
  createAnswerForSelectedAdjectivesSchema,
};
