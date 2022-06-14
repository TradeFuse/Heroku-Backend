const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function getCustomer(customerId) {
  let customer = "";
  try {
    customer = await stripe.customers.retrieve(customerId);
  } catch {
    if (!customer) {
      throw (`${customerId} is invalid`)
    }
  }
  return customer
};
