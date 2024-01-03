const {
  prisma,
  sendResponse,
  createOrUpdateUserAnswer,
  validateObjectProperties,
} = require("../utils");
const { CustomErrorHandler } = require("../services");

const activityWithTypeProperties = [
  "Activity 1",
  "Activity 2",
  "Activity 3",
  "Activity 4",
  "Activity 5",
  "Activity 1 type",
  "Activity 2 type",
  "Activity 3 type",
  "Activity 4 type",
  "Activity 5 type",
];
const activityProperties = ["Activity 1", "Activity 2"];
const jobProperties = ["Job 1", "Job 2", "Job 3"];

const createAnswerForSelectedAdjectives = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { interviewQuestionId, sectionId, newTexts = [] } = req.body;

  try {
    let newQuestions = [];

    if (newTexts.length) {
      const conditions = newTexts.map((word) => ({
        NOT: { questionText: { contains: word } },
      }));

      const existingQuestions = await prisma.interviewQuestion.findMany({
        where: {
          AND: [
            ...conditions,
            {
              dependentOnQuestionId: +interviewQuestionId,
              studentId: +studentId,
            },
          ],
        },
      });

      const currentQuestionAnswer = await prisma.interviewAnswer.findFirst({
        where: {
          interviewQuestionId,
          studentId,
        },
      });

      let updatedNewTexts = newTexts;
      if (currentQuestionAnswer) {
        updatedNewTexts = newTexts.filter(
          (text) => !currentQuestionAnswer.customAnswer.includes(text)
        );
      }

      newQuestions = await Promise.all(
        updatedNewTexts.map(async (text, i) => {
          const questionText = `Please provide specific example(s) to explain why ${text} applies.`;
          return prisma.interviewQuestion.upsert({
            where: {
              id: existingQuestions.length ? existingQuestions[i].id : -1,
            },
            update: {
              questionText: questionText,
            },
            create: {
              questionText: questionText,
              sectionId,
              studentId,
              dependentOnQuestionId: interviewQuestionId,
              inputType: "textField",
              answerType: "String",
              isRequired: true,
              minWordLimit: 20,
              maxWordLimit: 50,
              sampleAnswersId: i + 1,
            },
          });
        })
      );

      const existingQuestionIds = existingQuestions.map(
        (question) => question.id
      );

      await prisma.interviewAnswer.updateMany({
        where: {
          interviewQuestionId: {
            in: existingQuestionIds,
          },
        },
        data: {
          answerText: null,
        },
      });
    }

    const userAnswer = await prisma.interviewAnswer.findFirst({
      where: {
        studentId: studentId,
        interviewQuestionId: interviewQuestionId,
      },
    });

    await createOrUpdateUserAnswer(
      studentId,
      interviewQuestionId,
      newTexts,
      null,
      userAnswer?.id
    );

    sendResponse(res, 200, newQuestions, "Answer submitted successfully");
  } catch (error) {
    return next(error);
  }
};

const getAllAnswers = async (req, res, next) => {
  const { id: studentId } = req.user;
  try {
    const answers = await prisma.interviewAnswer.findMany({
      where: {
        studentId,
      },
    });
    sendResponse(res, 200, answers, "All answers fetched.");
  } catch (error) {
    return next(error);
  }
};

const getSelectedAdjectivesAnswers = async (req, res, next) => {
  const { id: studentId } = req.user;

  try {
    const selectedAdjectivesQuestions = await prisma.interviewQuestion.findMany(
      {
        where: {
          studentId,
          dependentOnQuestionId: 1,
        },
        include: {
          interviewAnswers: true,
        },
      }
    );

    const answers = selectedAdjectivesQuestions.map(
      (question) => question.interviewAnswers[0]
    );

    sendResponse(
      res,
      200,
      answers,
      "User selected adjectives successfully fetched."
    );
  } catch (error) {
    return next(error);
  }
};

const getAnswerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const answer = await prisma.interviewAnswer.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!answer) {
      return next(CustomErrorHandler.notFound());
    }
    sendResponse(res, 200, answer);
  } catch (error) {
    return next(error);
  }
};

const getAnswerByQuestionId = async (req, res, next) => {
  const { id: userId } = req.user;
  const { questionId } = req.params;

  try {
    const answer = await prisma.interviewAnswer.findFirst({
      where: {
        interviewQuestionId: parseInt(questionId),
        studentId: parseInt(userId),
      },
    });
    sendResponse(res, 200, answer);
  } catch (error) {
    return next(error);
  }
};

const deleteAnswerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const answer = await prisma.answer.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!answer) {
      return next(CustomErrorHandler.notFound());
    }

    await prisma.answer.delete({
      where: {
        id: parseInt(id),
      },
    });
    sendResponse(res, 200, answer, "Answer Successfully Deleted");
  } catch (error) {
    return next(error);
  }
};

const createOrUpdateAnswer = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { interviewQuestionId, answerText, customAnswer } = req.body;

  try {
    const question = await prisma.interviewQuestion.findUnique({
      where: {
        id: parseInt(interviewQuestionId),
      },
    });

    if (question.inputType === "textFields" && customAnswer) {
      let validationResult = false;
      let errorMessage = "";

      if (question.questionText.includes("top 5 activities")) {
        validationResult = validateObjectProperties(
          activityWithTypeProperties,
          customAnswer
        );
        errorMessage = "Activity text or field missing";
      } else if (question.questionText.includes("two activities")) {
        validationResult = validateObjectProperties(
          activityProperties,
          customAnswer
        );
        errorMessage = "Activity field missing";
      } else {
        validationResult = validateObjectProperties(
          jobProperties,
          customAnswer
        );
        errorMessage = "Job field missing";
      }

      if (!validationResult) {
        return next(CustomErrorHandler.customError(403, errorMessage));
      }
    }

    let answer = await prisma.interviewAnswer.findFirst({
      where: {
        studentId,
        interviewQuestionId,
      },
    });

    answer = await createOrUpdateUserAnswer(
      studentId,
      interviewQuestionId,
      customAnswer,
      answerText,
      answer?.id
    );

    sendResponse(res, 200, answer, "Answer successfully created or updated");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createAnswerForSelectedAdjectives,
  getAllAnswers,
  getSelectedAdjectivesAnswers,
  getAnswerById,
  getAnswerByQuestionId,
  deleteAnswerById,
  createOrUpdateAnswer,
};
