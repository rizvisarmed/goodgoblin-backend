const {
  comparePassword,
  hashPassword,
  sendEmail,
  createNewUser,
} = require("./auth");
const { prisma } = require("./prisma");
const { sendResponse, getPagination, convertToCamelCase } = require("./common");
const {
  validateObjectProperties,
  createOrUpdateUserAnswer,
  areAllRequiredQuestionsAnswered,
  prepAiAnsweredQuestionsPercentage,
} = require("./answer");
const {
  getPrompt,
  getEssaysWithTheirStatus,
  mapTypeToNumber,
  calculateRangeValue,
  generateWeekRanges,
  calculateDaysLeft,
  fetchTextFromOpenAiApi,
  executeApiCall,
  processEssayCoachingResponse,
  processResponseOfEssayCoaching,
  getCollegeWithStatus,
  saveRecommendationsTexts,
} = require("./essay");
const {
  categorizeElements,
  convertToNumber,
  convertToText,
  optionalProperty,
} = require("./scripts");
const { reorderQuestions } = require("./questions");
const { stripe, getCheckoutSession, getSubscription } = require("./payment");
const { uploadImage, upload, deleteImage } = require("./s3");
const { getStripeProductThings } = require("./webhook");

module.exports = {
  comparePassword,
  hashPassword,
  sendEmail,
  createNewUser,
  sendResponse,
  getPagination,
  convertToCamelCase,
  convertToNumber,
  convertToText,
  optionalProperty,
  validateObjectProperties,
  createOrUpdateUserAnswer,
  areAllRequiredQuestionsAnswered,
  prepAiAnsweredQuestionsPercentage,
  reorderQuestions,
  uploadImage,
  deleteImage,
  getPrompt,
  getEssaysWithTheirStatus,
  mapTypeToNumber,
  categorizeElements,
  calculateRangeValue,
  calculateDaysLeft,
  fetchTextFromOpenAiApi,
  generateWeekRanges,
  prisma,
  stripe,
  getCheckoutSession,
  getSubscription,
  upload,
  getStripeProductThings,
  executeApiCall,
  processEssayCoachingResponse,
  processResponseOfEssayCoaching,
  getCollegeWithStatus,
  saveRecommendationsTexts,
};
