const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function deleteCustomer(customerId) {
  let customer = "";
  try {
    customer = await stripe.customers.del(customerId);
  } catch {
    if (!customer) {
      return `Invalid Customer`;
    }
  }
  return customer;
};
