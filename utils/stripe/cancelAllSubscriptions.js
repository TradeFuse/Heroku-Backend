const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function cancelAllSubscriptions(subArray) {
  let deletecustomer = "";
  try {
    const subData = subArray;
    for (let i = 0, j = subData.length; i < j; i++) {
      if (customerId)
        deletecustomer = await stripe.subscriptions.del(subData[i]);
    }
    // subscribe them to stripe free
    /*     await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: "price_1L2hzIJEnF6qjMZiYVeo5pXg" }],
    }); */
  } catch {
    if (!deletecustomer) {
      return `Invalid Customer`;
    }
  }
  return deletecustomer;
};
