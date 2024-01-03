const { CustomErrorHandler } = require("../services");
const { prisma } = require("../utils");

const isSubscribed = async (req, res, next) => {
  const { id: userId, userEssay } = req.user;

  let user = userEssay?.collegeApplication.user;

  try {
    if (!user) {
      user = await prisma.user.findUnique({
        where: {
          id: +userId,
        },
      });
    }
    if (!user.isSubscriptionActive) {
      return next(CustomErrorHandler.unAuthorized("subscription end"));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  isSubscribed,
};
