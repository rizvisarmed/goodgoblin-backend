const { CustomErrorHandler } = require("../services");
const { prisma } = require("../utils");

const isUserEssay = async (req, res, next) => {
  const { id: userId } = req.user;
  const { essaySubmissionId } = req.body;
  const { id } = req.params;

  try {
    if (!id && !essaySubmissionId) {
      return next(
        CustomErrorHandler.customError(404, "EssaySubmissionId not provided.")
      );
    }

    const userEssay = await prisma.essaySubmission.findFirst({
      where: {
        id: +essaySubmissionId || +id,
        collegeApplication: {
          userId: +userId,
        },
      },
      include: {
        essay: true,
        collegeApplication: {
          include: {
            university: true,
            user: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!userEssay) {
      return next(
        CustomErrorHandler.customError(404, "Invalid essay specified")
      );
    }

    req.user = {
      ...req.user,
      userEssay,
    };

    next();
  } catch (error) {
    return next(error);
  }
};

const canDoEssential = async (req, res, next) => {
  const { userEssay } = req.user;

  const user = userEssay.collegeApplication.user;
  const planName = user.plan.name;

  const isAllowed =
    planName === "Basic"
      ? user.noOfEssentials > 0 || userEssay.isAllowForEssential
      : true;
  try {
    if (!isAllowed) {
      return next(
        CustomErrorHandler.unAuthorized("You don't have access of essentials.")
      );
    }
    next();
  } catch (error) {}
};

module.exports = {
  isUserEssay,
  canDoEssential,
};
