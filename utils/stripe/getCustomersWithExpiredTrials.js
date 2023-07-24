const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function getCustomersWithExpiredTrials(customerId) {
  const productPriceId = "price_1NQzfdJEnF6qjMZiV9Dn0wbW";
  let customersWithExpiredTrials = [];

  try {
    // Get all customers
    const customers = await stripe.customers.list();

    // Loop through each customer
    for (const customer of customers.data) {
      // Retrieve their subscription(s)
      const subscriptions = customer.subscriptions.data;

      // Check if any subscription has the target product price ID and trial has expired
      for (const subscription of subscriptions) {
        if (
          subscription.items.data.some(
            (item) =>
              item.price.id === productPriceId &&
              subscription.status === "trialing" &&
              subscription.trial_end < Math.floor(Date.now() / 1000)
          )
        ) {
          customersWithExpiredTrials.push(customer);
          break; // If one subscription matches, move to the next customer
        }
      }
    }

    return customersWithExpiredTrials;
  } catch (err) {
    console.error(err);
    return [];
  }
};
