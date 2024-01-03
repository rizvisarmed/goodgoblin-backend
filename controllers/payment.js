const {
  sendResponse,
  prisma,
  getCheckoutSession,
  stripe,
  getSubscription,
} = require("../utils");
const { FRONTEND_URL } = require("../config");
const { CustomErrorHandler } = require("../services");

const createCheckoutSession = async (req, res, next) => {
  const { id: userId } = req.user;
  const { priceId, quantity, essaySubmissionId, redirectUrl } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
      include: {
        plan: true,
      },
    });

    const metadata = {
      userId,
      priceId,
      quantity,
      essaySubmissionId,
    };

    const session = await getCheckoutSession(
      priceId,
      quantity,
      metadata,
      user.stripeCustomerId,
      `${FRONTEND_URL}/dashboard`,
      redirectUrl,
      user.isTrialAvailed
    );

    sendResponse(res, 200, {
      url: session.url,
    });
  } catch (error) {
    return next(error);
  }
};

const getUserSubscriptionDetail = async (req, res, next) => {
  const { id: userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });

    const subscription = await getSubscription(user.stripeCustomerId);

    if (!subscription) {
      return next(
        CustomErrorHandler.notFound("No active subscriptions found.")
      );
    }

    const renewalDate = new Date(
      subscription.current_period_end * 1000
    ).toLocaleDateString("en-US");
    const amount = (subscription.plan.amount / 100).toFixed(2);
    const currency = subscription.plan.currency.toUpperCase();

    sendResponse(res, 200, {
      renewalDate,
      amount,
      currency,
      isWillCancel: subscription.cancel_at_period_end,
    });
  } catch (error) {
    return next(error);
  }
};

const cancelUserSubscription = async (req, res, next) => {
  const { id: userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });

    const subscription = await getSubscription(user.stripeCustomerId);

    if (!subscription) {
      return next(
        CustomErrorHandler.notFound("No any active subscription of this user.")
      );
    }

    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    sendResponse(res, 200, null, "User subscription cancelled successfully.");
  } catch (error) {
    console.log("err", error);
    return next(error);
  }
};

module.exports = {
  createCheckoutSession,
  getUserSubscriptionDetail,
  cancelUserSubscription,
};
