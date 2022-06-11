const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function getCustomer(customerId) {
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer) {
    throw (`${customerId} is invalid`)
  }
  return customer
};
