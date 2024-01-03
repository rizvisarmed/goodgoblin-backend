const { CustomErrorHandler } = require("../services");
const { WEBHOOK_SECRET } = require("../config");
const {
  prisma,
  stripe,
  sendResponse,
  getStripeProductThings,
} = require("../utils");

const checkoutSessionWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    return next(
      CustomErrorHandler.customError(400, `Webhook Error: ${err.message}`)
    );
  }

  try {
    const session = event.data.object;
    let stripeCustomerId = session.customer;
    let customer;
    if (stripeCustomerId) {
      customer = await stripe.customers.retrieve(stripeCustomerId);
    }
    let quantity = 0;
    let userDataToBeUpdate = null;
    let userPurchased = null;
    let userId = null;
    let price = null;

    if (event.type === "checkout.session.completed") {
      const metadata = session.metadata;
      userId = +metadata.userId;
      const priceId = metadata.priceId;
      quantity = +metadata.quantity;

      if (!userId || !priceId) {
        return next(CustomErrorHandler.notFound("UserId or priceId not found"));
      }

      price = await stripe.prices.retrieve(priceId);

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          plan: true,
        },
      });

      if (user.stripeCustomerId) {
        stripeCustomerId = user.stripeCustomerId;
      } else if (!stripeCustomerId && !user.stripeCustomerId) {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        stripeCustomerId = newCustomer.id;
      }

      const initialNoOfEssaysToGenerate = +user.noOfEssaysToGenerate;

      const plans = await prisma.plan.findMany();

      const plan = plans
        .filter((plan) => Array.isArray(plan.prices))
        .find((plan) => plan.prices.find((price) => price.id === priceId));

      if (quantity && plan.name === "Buy Starter Essay") {
        userDataToBeUpdate = {
          noOfEssaysToGenerate: String(initialNoOfEssaysToGenerate + +quantity),
        };
        userPurchased = `${quantity} Essay${quantity > 1 ? "s" : ""}`;
      } else {
        const purchasedObj = getStripeProductThings(
          initialNoOfEssaysToGenerate
        )[priceId];

        userPurchased = purchasedObj.userPurchased;
        delete purchasedObj.userPurchased;
        userDataToBeUpdate = {
          ...purchasedObj,
          planId: plan.id,
          isSubscriptionActive: true,
        };
      }

      await stripe.customers.update(stripeCustomerId, {
        metadata: {
          userId,
        },
      });
    } else if (event.type === "customer.subscription.updated") {
      userId = +customer.metadata.userId;
      const priceId = session.plan.id;

      if (!userId || !priceId) {
        return next(CustomErrorHandler.notFound("UserId or priceId not found"));
      }
      price = await stripe.prices.retrieve(priceId);

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          plan: true,
        },
      });

      if (session.cancel_at && session.cancel_at_period_end) {
        const unixTimestamp = session.cancel_at;
        const date = new Date(unixTimestamp * 1000);
        const formattedDate = date.toLocaleDateString("en-US");
        userPurchased = `${user.plan.name} subscription will cancel at ${formattedDate}`;
      } else {
        quantity = +session.plan.interval_count;

        const initialNoOfEssaysToGenerate = +user.noOfEssaysToGenerate;
        const initialUserPlan = user.plan;

        const plans = await prisma.plan.findMany();

        const plan = plans
          .filter((plan) => Array.isArray(plan.prices))
          .find((plan) => plan.prices.find((price) => price.id === priceId));

        if (initialUserPlan.name === "Pro" && plan.name === "Pro Plus+") {
          userDataToBeUpdate = {
            noOfAiChecks: "unlimited",
            planId: plan.id,
            isSubscriptionActive: true,
            isTrialAvailed: true,
          };
          userPurchased = "Unlimited Ai-Checks";
        } else {
          const purchasedObj = getStripeProductThings(
            initialNoOfEssaysToGenerate
          )[priceId];

          userPurchased = purchasedObj.userPurchased;
          delete purchasedObj.userPurchased;
          userDataToBeUpdate = {
            ...purchasedObj,
            planId: plan.id,
            isSubscriptionActive: true,
            isTrialAvailed: true,
          };
        }
      }
    } else if (event.type === "invoice.payment_failed") {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
      });
      const subscriptionId = subscriptions.data[0].id;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const now = Math.floor(Date.now() / 1000);

      if (subscription.current_period_end > now) {
        userId = +customer.metadata.userId;
        const priceId = session.plan.id;

        if (!userId || priceId) {
          return next(
            CustomErrorHandler.notFound("UserId or priceId  not found")
          );
        }
        price = await stripe.prices.retrieve(priceId);

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          include: {
            plan: true,
          },
        });

        userDataToBeUpdate = {
          planId: 1,
          isSubscriptionActive: false,
          noOfAiChecks: "0",
          noOfEssaysToGenerate: "0",
        };

        userPurchased = `${user.plan.name} subscription cancelled`;
      }
    } else if (event.type === "customer.subscription.deleted") {
      userId = +customer.metadata.userId;
      const priceId = session.plan.id;

      price = await stripe.prices.retrieve(priceId);

      if (!userId || !priceId) {
        return next(CustomErrorHandler.notFound("UserId or priceId not found"));
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          plan: true,
        },
      });

      userDataToBeUpdate = {
        planId: 1,
        isSubscriptionActive: false,
        noOfAiChecks: "0",
        noOfEssaysToGenerate: "0",
      };

      userPurchased = `${user.plan.name} subscription cancelled`;
    }

    await prisma.user.update({
      where: {
        id: +userId,
      },
      data: {
        ...userDataToBeUpdate,
        stripeCustomerId,
      },
    });

    if (userPurchased) {
      await prisma.transaction.create({
        data: {
          userId,
          currency: session.currency,
          status: session.status,
          amount: price.unit_amount / 100,
          subscriptions: userPurchased,
        },
      });
    }

    sendResponse(res, 200, {
      received: true,
      message: "user subscription updated",
    });
  } catch (error) {
    console.log("err", error);
    return next(error);
  }
};

const testWebhook = async (req, res, next) => {
  const { priceId } = req.params;
  try {
    const price = await stripe.prices.retrieve(priceId);
    sendResponse(res, 200, {
      data: price,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  checkoutSessionWebhook,
  testWebhook,
};
