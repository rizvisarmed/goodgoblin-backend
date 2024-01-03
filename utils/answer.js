const { prisma } = require("./prisma");

const createOrUpdateUserAnswer = async (
  studentId,
  interviewQuestionId,
  customAnswer,
  answerText,
  id
) => {
  if (id) {
    return await prisma.interviewAnswer.update({
      where: {
        id,
      },
      data: {
        ...(answerText && { answerText }),
        ...(customAnswer && { customAnswer }),
      },
    });
  } else {
    return await prisma.interviewAnswer.create({
      data: {
        studentId,
        interviewQuestionId,
        ...(answerText && { answerText }),
        ...(customAnswer && { customAnswer }),
      },
    });
  }
};

const validateObjectProperties = (requiredProperties, obj) => {
  for (const property of requiredProperties) {
    if (!obj.hasOwnProperty(property) || obj[property] === "") {
      return false;
    }
  }
  return true;
};

const areAllRequiredQuestionsAnswered = (section) => {
  const questions = section.interviewQuestions;

  return questions.every((question) => {
    if (section.isRequired && !question.isRequired) {
      return true;
    }

    const answer = question.interviewAnswers.find(
      (ans) => ans.interviewQuestionId === question.id
    );

    return Boolean(answer?.answerText || answer?.customAnswer);
  });
};

const prepAiAnsweredQuestionsPercentage = async (sections) => {
  const allQuestions = sections.reduce((acc, section) => {
    return acc.concat(section.interviewQuestions);
  }, []);

  const allAnswers = allQuestions
    .map((question) => question.interviewAnswers[0])
    .filter((answer) => answer && (answer.answerText || answer.customAnswer));

  const answeredPercentage = Math.ceil(
    (allAnswers.length / allQuestions.length) * 100
  );
  return answeredPercentage;
};

module.exports = {
  validateObjectProperties,
  createOrUpdateUserAnswer,
  areAllRequiredQuestionsAnswered,
  prepAiAnsweredQuestionsPercentage,
};
