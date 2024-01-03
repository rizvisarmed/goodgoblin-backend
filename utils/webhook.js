const {
  stripeProductsPrices: {
    proPer3Months,
    proPer6Months,
    proPerMonth,
    proPlus3Months,
    proPlus6Months,
    proPlusPerMonth,
    essentialsPerMonth,
    essentials3Months,
    essentials6Months,
  },
} = require("../constants");

const getStripeProductThings = (initialNoOfEssaysToGenerate) => {
  return {
    [proPerMonth]: {
      noOfEssaysToGenerate: "4",
      userPurchased: "Pro Month",
    },
    [proPer3Months]: {
      noOfEssaysToGenerate: "12",
      userPurchased: "Pro 3 Months",
    },
    [proPer6Months]: {
      noOfEssaysToGenerate: "24",
      userPurchased: "Pro 6 Months",
    },
    [proPlusPerMonth]: {
      noOfEssaysToGenerate: "4",
      noOfAiChecks: "unlimited",
      userPurchased: "Pro+ Month",
    },
    [proPlus3Months]: {
      noOfEssaysToGenerate: "12",
      noOfAiChecks: "unlimited",
      userPurchased: "Pro+ 3 Months",
    },
    [proPlus6Months]: {
      noOfEssaysToGenerate: "24",
      noOfAiChecks: "unlimited",
      userPurchased: "Pro+ 6 Months",
    },
    [essentialsPerMonth]: {
      noOfEssaysToGenerate: "1",
      userPurchased: "Essentials Month",
    },
    [essentials3Months]: {
      noOfEssaysToGenerate: "3",
      userPurchased: "Essentials 3 Months",
    },
    [essentials6Months]: {
      noOfEssaysToGenerate: "6",
      userPurchased: "Essentials 6 Months",
    },
  };
};

module.exports = {
  getStripeProductThings,
};
