const joi = require("joi");

const reportIssueSchema = joi.object({
  universityDeadlineId: joi.number().integer().required(),
  essaySubmissionId: joi.number().integer().optional(),
  type: joi.string().valid("university", "essay").required(),
  otherDetails: joi.object().required(),
});

module.exports = {
  reportIssueSchema,
};
