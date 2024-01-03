const { prisma, sendResponse, sendEmail } = require("../utils");
const { sendGridEmailAddresses } = require("../constants");
const {
  REPORTING_COLLEGE_ERROR_TEMPLATE_ID,
  REPORTING_ESSAY_ERROR_TEMPLATE_ID,
  ACKNOWLEDGEMENT_TO_CUSTOMER,
} = require("../config");
const { CustomErrorHandler } = require("../services");

const reportIssue = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { universityDeadlineId, essaySubmissionId, type, otherDetails } =
    req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: +studentId,
      },
    });

    const isUniversityExists = await prisma.userUniversityDeadline.findUnique({
      where: {
        id: +universityDeadlineId,
      },
      include: {
        university: true,
        deadline: true,
      },
    });

    if (!isUniversityExists) {
      return next(CustomErrorHandler.notFound("No university present."));
    }

    let isEssayExists;
    if (essaySubmissionId) {
      isEssayExists = await prisma.essay.findUnique({
        where: {
          id: +essaySubmissionId,
        },
      });
      if (!isEssayExists) {
        return next(CustomErrorHandler.notFound("No essay present."));
      }
    }

    const [date, time] = new Date()
      .toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
      .split(",");

    const issue = await prisma.reportedIssue.create({
      data: {
        studentId,
        ...req.body,
      },
    });

    await sendEmail(
      sendGridEmailAddresses.errorReporting,
      user.email,
      {
        First_Name: user.firstName,
        Last_Name: user.lastName,
        Date: date,
        Pacific_Time: time,
        Email: user.email,
        College: isUniversityExists.university.name,
        Existing_Essay: isEssayExists?.text,
        Deadline_Name: isUniversityExists.deadline.name,
        Deadline_Date: isUniversityExists.deadline.deadline,
        ...otherDetails,
      },
      type === "essay"
        ? REPORTING_ESSAY_ERROR_TEMPLATE_ID
        : REPORTING_COLLEGE_ERROR_TEMPLATE_ID
    );

    if (otherDetails.inform_me_when_addressed) {
      await sendEmail(
        user.email,
        sendGridEmailAddresses.customerSuccess,
        {
          First_Name: user.firstName,
          Last_Name: user.lastName,
          College: isUniversityExists.university.name,
          Existing_Essay: isEssayExists?.text,
          ...otherDetails,
        },
        ACKNOWLEDGEMENT_TO_CUSTOMER
      );
    }

    sendResponse(res, 200, issue, "Issue is reported successfully.");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  reportIssue,
};
