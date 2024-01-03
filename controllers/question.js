const { prisma, sendResponse, reorderQuestions } = require("../utils");
const { CustomErrorHandler } = require("../services");

const createNewQuestion = async (req, res, next) => {
  const { question, subQuestions, wordLimit } = req.body;
  try {
    const newQuestion = await prisma.question.create({
      data: {
        question,
        subQuestions,
        wordLimit,
      },
    });
    sendResponse(res, 201, newQuestion, "New Question Successfully Created");
  } catch (error) {
    return next(error);
  }
};

const getAllQuestions = async (req, res, next) => {
  try {
    const { id: studentId } = req.user;
    const questions = await prisma.interviewQuestion.findMany({
      where: {
        OR: [{ studentId: null }, { studentId }],
      },
    });
    sendResponse(res, 200, questions);
  } catch (error) {
    return next(error);
  }
};

const getAllQuestionsBySectionId = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { sectionId } = req.params;

  try {
    let questions = await prisma.interviewQuestion.findMany({
      where: {
        sectionId: +sectionId,
        OR: [{ studentId: null }, { studentId }],
      },
      include: {
        interviewAnswers: {
          where: {
            studentId,
          },
          select: {
            id: true,
            answerText: true,
            customAnswer: true,
          },
        },
        sampleAnswers: {
          select: {
            texts: true,
          },
        },
      },
    });

    if (sectionId == 1) {
      questions = reorderQuestions(questions);
    }

    const questionsWithIsAnswer = questions.map((question) => {
      const { interviewAnswers, ...questionWithoutAnswers } = question;

      return {
        ...questionWithoutAnswers,
        isAnswer: !!interviewAnswers.find(
          (answer) => answer.answerText || answer.customAnswer
        ),
      };
    });

    sendResponse(
      res,
      200,
      questionsWithIsAnswer,
      "All questions fetched by sectionId."
    );
  } catch (error) {
    return next(error);
  }
};

const getQuestionById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const question = await prisma.question.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!question) {
      return next(CustomErrorHandler.notFound());
    }
    sendResponse(res, 200, question);
  } catch (error) {
    return next(error);
  }
};

const updateQuestionById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const question = await prisma.question.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!question) {
      return next(CustomErrorHandler.notFound());
    }
    const updatedQuestion = await prisma.question.update({
      where: {
        id: parseInt(id),
      },
      data: {
        ...req.body,
      },
    });
    sendResponse(
      res,
      201,
      updatedQuestion,
      "New Question Successfully Updated"
    );
  } catch (error) {
    return next(error);
  }
};

const deleteQuestionById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const question = await prisma.question.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!question) {
      return next(CustomErrorHandler.notFound());
    }

    await prisma.question.delete({
      where: {
        id: parseInt(id),
      },
    });
    sendResponse(res, 200, question, "Question Successfully Deleted");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createNewQuestion,
  getAllQuestions,
  getAllQuestionsBySectionId,
  getQuestionById,
  updateQuestionById,
  deleteQuestionById,
};
