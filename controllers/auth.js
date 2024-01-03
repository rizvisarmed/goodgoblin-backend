const {
  prisma,
  hashPassword,
  comparePassword,
  sendResponse,
  sendEmail,
  createNewUser,
  getCheckoutSession,
} = require("../utils");
const { CustomErrorHandler, JwtService } = require("../services");
const {
  FRONTEND_URL,
  BACKEND_URL,
  SENDGRID_ONBOARDING_TEMPLATE_ID,
  SENDGRID_RESET_EMAIL_TEMPLATE_ID,
} = require("../config");
const { sendGridEmailAddresses, ADMIN } = require("../constants");

const register = async (req, res, next, role) => {
  const { priceId } = req.query;
  const { firstName, lastName, email, password } = req.body;

  try {
    const exist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (exist) {
      return next(
        CustomErrorHandler.alreadyExist("This email is already taken.")
      );
    }

    const token = JwtService.sign(
      {
        firstName,
        lastName,
        email,
        password,
        role,
        isOrientationCompleted: false,
      },
      "1d"
    );

    const btn_url = `${BACKEND_URL}verifyEmail?token=${token}${
      priceId ? `&priceId=${priceId}` : ""
    }`;

    await sendEmail(
      email,
      sendGridEmailAddresses.onBoarding,
      {
        btn_url,
      },
      SENDGRID_ONBOARDING_TEMPLATE_ID
    );

    sendResponse(res, 200, null, "Please check your email for verification.");
  } catch (err) {
    return next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  const { token, priceId } = req.query;

  try {
    if (!token) {
      return next(
        CustomErrorHandler.customError(400, "Invalid or missing token")
      );
    }

    const decoded = JwtService.verify(token);

    const { iat, exp, ...user } = decoded;

    const newUser = await createNewUser(user, false, next);

    const successUrl = `${FRONTEND_URL}auth/login?user=${JSON.stringify({
      ...newUser,
      fromStripe: true,
    })}`;
    const cancelUrl = `${FRONTEND_URL}auth/login?user=${JSON.stringify(
      newUser
    )}`;

    if (priceId) {
      const session = await getCheckoutSession(
        priceId,
        1,
        {
          userId: newUser.id,
          priceId,
          quantity: 1,
        },
        null,
        successUrl,
        cancelUrl,
        newUser.isTrialAvailed
      );
      res.redirect(session.url);
    } else {
      res.redirect(cancelUrl);
    }
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  const { isAdmin } = req;
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        plan: true,
      },
    });

    if (isAdmin && user.role !== ADMIN) {
      return next(CustomErrorHandler.unAuthorized());
    }

    if (!user || !user.password) {
      return next(CustomErrorHandler.notFound("No user present."));
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return next(CustomErrorHandler.wrongCredentials());
    }

    const access_token = JwtService.sign({
      id: user.id,
    });

    delete user.password;

    sendResponse(
      res,
      200,
      {
        ...user,
        token: access_token,
      },
      "User Successfully Logged In"
    );
  } catch (error) {
    return next(error);
  }
};

const onSocialLoginSuccess = async (req, res, next) => {
  const priceId = req.query?.priceId;

  try {
    if (req.user) {
      const { given_name, family_name, picture, email } = req.user._json;

      const user = await createNewUser(
        {
          firstName: given_name,
          lastName: family_name,
          email,
          imgUrl: picture,
          role: "student",
        },
        true,
        next
      );

      const successUrl = `${FRONTEND_URL}auth/login?user=${JSON.stringify({
        ...user,
        fromStripe: true,
      })}`;

      const cancelUrl = `${FRONTEND_URL}auth/login?user=${JSON.stringify(
        user
      )}`;

      if (priceId) {
        const session = await getCheckoutSession(
          priceId,
          1,
          {
            userId: user.id,
            priceId,
            quantity: 1,
          },
          null,
          successUrl,
          cancelUrl,
          user.isTrialAvailed
        );
        res.redirect(session.url);
      } else {
        res.redirect(cancelUrl);
      }
    } else {
      return next(CustomErrorHandler.unAuthorized());
    }
  } catch (error) {
    return next(error);
  }
};

const onSocialLoginFailed = async (req, res) => {
  sendResponse(res, 401, {
    error: true,
    message: "Log in failure",
  });
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(CustomErrorHandler.wrongCredentials());
    }

    const existingToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
      },
    });

    const token = JwtService.sign({ id: user.id }, "1hr");

    if (!existingToken) {
      const expiresAt = new Date(Date.now() + 3600000);
      await prisma.passwordResetToken.create({
        data: {
          token,
          expiresAt,
          userId: user.id,
        },
      });

      await sendEmail(
        email,
        sendGridEmailAddresses.resetPassword,
        {
          btn_url: `${FRONTEND_URL}auth/resetPassword?token=${token}`,
        },
        SENDGRID_RESET_EMAIL_TEMPLATE_ID
      );
      sendResponse(res, 200, null, "Reset email sent successfully");
    }

    if (existingToken.expiresAt > new Date()) {
      await sendEmail(
        email,
        sendGridEmailAddresses.resetPassword,
        {
          btn_url: `${FRONTEND_URL}auth/resetPassword?token=${token}`,
        },
        SENDGRID_RESET_EMAIL_TEMPLATE_ID
      );
      sendResponse(res, 200, null, "Reset email sent successfully");
    } else {
      await prisma.passwordResetToken.upsert({
        where: {
          id: existingToken.id,
        },
        update: {
          token,
          expiresAt: new Date(Date.now() + 3600000),
        },
        create: {
          token,
          expiresAt: new Date(Date.now() + 3600000),
          userId: user.id,
        },
      });

      await sendEmail(
        email,
        sendGridEmailAddresses.resetPassword,
        {
          btn_url: `${FRONTEND_URL}auth/resetPassword?token=${token}`,
        },
        SENDGRID_RESET_EMAIL_TEMPLATE_ID
      );
      sendResponse(res, 200, null, "Reset email sent successfully");
    }
  } catch (error) {
    return next(error);
  }
};

const sendValidTokenResponse = async (req, res, next) => {
  sendResponse(res, 200, { isValid: true });
};

const resetPassword = async (req, res, next) => {
  const { passwordResetToken } = req;
  const { newPassword } = req.body;

  if (!passwordResetToken)
    return next(new CustomErrorHandler(400, "Invalid token"));

  try {
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: passwordResetToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
      where: {
        id: passwordResetToken.id,
      },
    });

    sendResponse(res, 200, null, "Password successfully updated");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  sendValidTokenResponse,
  resetPassword,
  onSocialLoginSuccess,
  onSocialLoginFailed,
};
