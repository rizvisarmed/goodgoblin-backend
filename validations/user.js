const joi = require("joi");

const { essayModes } = require("../constants");

const nameSchema = joi.object({
  firstName: joi.string().min(3).max(30).required(),
  lastName: joi.string().min(3).max(30).required(),
});

const passwordSchema = joi.object({
  oldPassword: joi.string().required(),
  newPassword: joi
    .string()
    .min(8)
    .regex(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.@#]/)
    .required(),
  repeatPassword: joi.ref("newPassword"),
});

const updateUserDetailsSchema = joi.object({
  essayMode: joi.string().valid(...Object.values(essayModes)),
  isToneMatching: joi.boolean(),
});

module.exports = {
  nameSchema,
  passwordSchema,
  updateUserDetailsSchema,
};
