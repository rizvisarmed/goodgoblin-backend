const joi = require("joi");

const createEssaySchema = joi.object({
  universityId: joi.number().integer().positive().required(),
  text: joi.string().required(),
  minWordLimit: joi.number().integer().positive().required(),
  maxWordLimit: joi.number().integer().positive().required(),
});

const submitEssaySchema = joi.object({
  collegeApplicationId: joi.number().integer().positive().required(),
  essayId: joi.number().integer().positive().required(),
});

const saveEssaySchema = joi.object({
  essaySubmissionId: joi.number().integer().positive().required(),
  essayText: joi.string().required(),
});

const generateFinalEssaySchema = joi.object({
  essaySubmissionId: joi.number().integer().positive().required(),
  essayText: joi.string().allow(null, ""),
});

const generateEssaySchema = joi.object({
  essaySubmissionId: joi.number().integer().positive().required(),
});

const markFavoriteEssaySchema = joi.object({
  versionName: joi.string().valid("v1", "v2", "v3").required(),
});

const updatePersonalizeEssaySchema = joi.object({
  essayText: joi.string().required(),
});

const getAllSystemGuidanceByIdsSchema = joi.object({
  systemGuidanceIds: joi.array().items(joi.number().integer()).required(),
});

module.exports = {
  createEssaySchema,
  submitEssaySchema,
  saveEssaySchema,
  generateEssaySchema,
  generateFinalEssaySchema,
  markFavoriteEssaySchema,
  updatePersonalizeEssaySchema,
  getAllSystemGuidanceByIdsSchema,
};
