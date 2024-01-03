const { sendResponse, prisma } = require("../utils");

const getTransactionsByUserId = async (req, res, next) => {
  const { id: userId } = req.user;

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
    });
    sendResponse(res, 200, transactions, "transactions successfully fetched");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTransactionsByUserId,
};
