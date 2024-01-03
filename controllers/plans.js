const { sendResponse, prisma } = require("../utils");
const { stripeProductsPrices } = require("../constants");

const getPlans = async (req, res, next) => {
  try {
    const plans = await prisma.plan.findMany();
    sendResponse(res, 200, plans, "Plans fetched successfully.");
  } catch (error) {
    return next(error);
  }
};

const getPlanIds = async (req, res, next) => {
  try {
    sendResponse(res, 200, stripeProductsPrices);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPlans,
  getPlanIds,
};
