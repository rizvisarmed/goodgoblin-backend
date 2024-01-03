const {
  prisma,
  sendResponse,
  areAllRequiredQuestionsAnswered,
} = require("../utils");

const createNewSection = async (req, res, next) => {
  const { sectionName, sectionSubTitle, isRequired, interviewQuestions } =
    req.body;
  try {
    const newSection = await prisma.interviewSection.create({
      data: {
        sectionName,
        sectionSubTitle,
        isRequired,
        interviewQuestions: {
          create: interviewQuestions.map(
            (interviewQuestion) => interviewQuestion
          ),
        },
      },
    });
    sendResponse(res, 201, newSection, "New Section Successfully Created");
  } catch (error) {
    return next(error);
  }
};

const getAllSections = async (req, res, next) => {
  const { id: studentId } = req.user;
  const { isRequired } = req.query;

  try {
    const sections = await prisma.interviewSection.findMany({
      where: {
        ...(isRequired && { isRequired: JSON.parse(isRequired) }),
      },
      select: {
        id: true,
        isRequired: true,
        sectionName: true,
        sectionSubTitle: true,
        interviewQuestions: {
          where: {
            OR: [{ studentId: null }, { studentId }],
          },
          include: {
            interviewAnswers: {
              where: {
                studentId,
              },
            },
          },
        },
      },
    });

    const sectionsWithCompletionStatus = sections
      .map((section) => {
        return {
          ...section,
          isCompleted: areAllRequiredQuestionsAnswered(section),
        };
      })
      .sort((a, b) => {
        return a.isRequired === b.isRequired ? 0 : a.isRequired ? -1 : 1;
      });

    sendResponse(
      res,
      200,
      sectionsWithCompletionStatus,
      "All sections fetched."
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createNewSection,
  getAllSections,
};
