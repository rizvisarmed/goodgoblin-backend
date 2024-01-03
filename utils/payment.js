const { STRIPE_SECRET_KEY } = require("../config");

const stripe = require("stripe")(STRIPE_SECRET_KEY);

const getCheckoutSession = async (
  priceId,
  quantity,
  metadata,
  stripeCustomerId,
  success_url,
  cancel_url,
  isTrialAvailed
) => {
  const price = await stripe.prices.retrieve(priceId);

  const isOneTimePlan = price.type === "one_time";
  // const freeTrialDays = price?.recurring?.trial_period_days;

  const product = await stripe.products.retrieve(price.product);

  const isUserValidForTrial = false;
  // !isTrialAvailed && product.name.includes("Essentials");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: isOneTimePlan ? "payment" : "subscription",
    ...(stripeCustomerId && {
      customer: stripeCustomerId,
    }),
    line_items: [
      {
        price: priceId,
        quantity: +quantity,
      },
    ],
    ...(isUserValidForTrial && {
      subscription_data: {
        trial_period_days: 3,
      },
    }),
    metadata,
    allow_promotion_codes: true,
    success_url,
    cancel_url,
  });

  return session;
};

const getSubscription = async (stripeCustomerId) => {
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
  });

  const activeSubscriptions = subscriptions.data.filter(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  return activeSubscriptions[0];
};

module.exports = {
  stripe,
  getCheckoutSession,
  getSubscription,
};
