const joi = require("joi");

const sendConfirmationEmailToUserAndCompanySchema = joi.object({
  First_Name: joi.string().min(3).max(30).required(),
  Last_Name: joi.string().min(3).max(30).required(),
  Date: joi.string().allow(null, ""),
  Pacific_Time: joi.string().allow(null, ""),
  Email: joi.string().email().required(),
  Phone_Number: joi.string().required(),
  Message: joi.string().required(),
});

module.exports = {
  sendConfirmationEmailToUserAndCompanySchema,
};
