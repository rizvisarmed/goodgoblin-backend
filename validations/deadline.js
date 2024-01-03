const joi = require("joi");

const createDeadlineSchema = joi.object({
  deadline: joi.date().iso().required(),
  universityId: joi.number().integer().positive().required(),
});

const updateDeadlineSchema = joi.object({
  deadline: joi.date().iso(),
  universityId: joi.number().integer().positive(),
});

module.exports = {
  createDeadlineSchema,
  updateDeadlineSchema,
};
