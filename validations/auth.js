const joi = require("joi");

const registerSchema = joi.object({
  firstName: joi.string().min(3).max(30).required(),
  lastName: joi.string().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi
    .string()
    .min(8)
    .regex(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.@#]/)
    .message(
      "Must be at least 8 characters and use at least one special character."
    ),
  confirmPassword: joi.ref("password"),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

const forgotPasswordSchema = joi.object({
  email: joi.string().email().required(),
});

const resetPasswordSchema = joi.object({
  token: joi.string().required(),
  newPassword: joi
    .string()
    .min(8)
    .regex(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.@#]/)
    .message(
      "Must be at least 8 characters and use at least one special character."
    ),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
