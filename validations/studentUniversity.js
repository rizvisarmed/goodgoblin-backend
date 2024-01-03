const joi = require("joi");

const createStudentUniversitySchema = joi.object({
  universityId: joi.number().integer().positive().required(),
});

const updateStudentUniversityFieldSchema = joi
  .object({
    deadlineId: joi.number().integer().positive(),
    type: joi.string().valid("reach", "target", "safety"),
  })
  .min(1);

module.exports = {
  createStudentUniversitySchema,
  updateStudentUniversityFieldSchema,
};
