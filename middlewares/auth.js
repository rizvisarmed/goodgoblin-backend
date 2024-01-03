const { CustomErrorHandler, JwtService } = require("../services");
const { prisma } = require("../utils");
const { ADMIN } = require("../constants");
const { ESSAYGEN_TOKEN } = require("../config");

const auth = (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(CustomErrorHandler.unAuthorized());
  }

  const token = authHeader.split(" ")[1];

  try {
    const { id, role } = JwtService.verify(token);

    req.user = {
      id,
      role,
    };

    next();
  } catch (error) {
    return next(CustomErrorHandler.tokenExpired());
  }
};

const admin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return next(CustomErrorHandler.notFound());
    }
    if (user.role === ADMIN) {
      next();
    } else {
      return next(CustomErrorHandler.unAuthorized());
    }
  } catch (err) {
    return next(CustomErrorHandler.serverError(err.message));
  }
};

const checkTokenValidity = async (req, res, next) => {
  const { token } = req.body;

  if (!token)
    return next(new CustomErrorHandler(400, "Please provide a token"));

  try {
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    if (!existingToken) {
      return res.status(400).json({ error: "Invalid token" });
    }

    if (existingToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: {
          id: existingToken.id,
        },
      });
      return res.status(400).json({ error: "Token expired" });
    }

    req.passwordResetToken = existingToken;

    next();
  } catch (err) {
    next(err);
  }
};

const verifyEssayGen = async (req, res, next) => {
  const { success, token, essayId, data, dataOfFinal } = req.body;
  if (token !== ESSAYGEN_TOKEN)
    return res
      .status(401)
      .send("You're not authorized to make requests to this endpoint");
  if ((!success || !essayId || !data) && !dataOfFinal)
    return res
      .status(400)
      .send("Please include success status, essay ID, and essay data");
  if (!success && !essayId && !data && !dataOfFinal)
    return res.status(400).send("Please include dataOfFinal");

  return next();
};

module.exports = {
  auth,
  admin,
  checkTokenValidity,
  verifyEssayGen,
};
