const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function cancelAllSubscriptions(subArray) {
  let deletecustomer = "";
  try {
    const subData = subArray;
    for (let i = 0, j = subData.length; i < j; i++) {
      deletecustomer = await stripe.subscriptions.del(subData[i]);
    }
  } catch {
    if (!deletecustomer) {
      return `Invalid Customer`;
    }
  }
  return deletecustomer;
};
