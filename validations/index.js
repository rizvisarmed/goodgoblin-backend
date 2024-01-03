const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("./auth");
const {
  createUniversitySchema,
  updateUniversitySchema,
} = require("./university");
const { createQuestionSchema, updateQuestionSchema } = require("./question");
const {
  createUpdateAnswerSchema,
  createAnswerForSelectedAdjectivesSchema,
} = require("./answer");
const { createDeadlineSchema, updateDeadlineSchema } = require("./deadline");
const {
  createEssaySchema,
  submitEssaySchema,
  saveEssaySchema,
  generateEssaySchema,
  markFavoriteEssaySchema,
  updatePersonalizeEssaySchema,
  generateFinalEssaySchema,
  getAllSystemGuidanceByIdsSchema,
} = require("./essay");
const {
  createStudentUniversitySchema,
  updateStudentUniversityFieldSchema,
} = require("./studentUniversity");
const { createSectionSchema } = require("./section");
const {
  nameSchema,
  passwordSchema,
  updateUserDetailsSchema,
} = require("./user");
const { sendConfirmationEmailToUserAndCompanySchema } = require("./email");
const { createCheckoutSessionSchema } = require("./payment");
const { reportIssueSchema } = require("./reportedIssue");
const { transformEssaySchema } = require("./essentials");

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createUniversitySchema,
  updateUniversitySchema,
  createQuestionSchema,
  updateQuestionSchema,
  createUpdateAnswerSchema,
  createAnswerForSelectedAdjectivesSchema,
  createDeadlineSchema,
  updateDeadlineSchema,
  createStudentUniversitySchema,
  createEssaySchema,
  submitEssaySchema,
  generateFinalEssaySchema,
  saveEssaySchema,
  updatePersonalizeEssaySchema,
  markFavoriteEssaySchema,
  generateEssaySchema,
  updateStudentUniversityFieldSchema,
  createSectionSchema,
  nameSchema,
  passwordSchema,
  updateUserDetailsSchema,
  sendConfirmationEmailToUserAndCompanySchema,
  getAllSystemGuidanceByIdsSchema,
  createCheckoutSessionSchema,
  reportIssueSchema,
  transformEssaySchema,
};
