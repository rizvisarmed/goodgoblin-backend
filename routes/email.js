const express = require("express");

const {
  sendConfirmationEmailToUserAndCompany,
} = require("../controllers/email");
const {
  sendConfirmationEmailToUserAndCompanySchema,
} = require("../validations/email");
const { validate } = require("../middlewares");

const router = express.Router();

router.post(
  "/sendConfirmationEmailToUserAndCompany",
  validate(sendConfirmationEmailToUserAndCompanySchema),
  sendConfirmationEmailToUserAndCompany
);

module.exports = { emailRoutes: router };
