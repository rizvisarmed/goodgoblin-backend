const { sendEmail, sendResponse } = require("../utils");
const {
  EMAIL_TO_COMPANY_TEMPLATE_ID,
  EMAIL_TO_CUSTOMER_TEMPLATE_ID,
} = require("../config");
const { sendGridEmailAddresses } = require("../constants");

const sendConfirmationEmailToUserAndCompany = async (req, res, next) => {
  const {
    First_Name,
    Last_Name,
    Date,
    Pacific_Time,
    Email,
    Phone_Number,
    Message,
  } = req.body;

  try {
    await sendEmail(
      sendGridEmailAddresses.contactUs,
      sendGridEmailAddresses.contactUs,
      {
        Date,
        Pacific_Time,
        First_Name,
        Last_Name,
        Email,
        Phone_Number,
        Message,
      },
      EMAIL_TO_COMPANY_TEMPLATE_ID
    );

    await sendEmail(
      Email,
      sendGridEmailAddresses.contactUs,
      {
        First_Name,
        Last_Name,
        Message,
      },
      EMAIL_TO_CUSTOMER_TEMPLATE_ID
    );

    sendResponse(res, 200, null, "Email are sent successfully");
  } catch (error) {
    return next(err);
  }
};

module.exports = {
  sendConfirmationEmailToUserAndCompany,
};
