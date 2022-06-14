const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function createCustomer(bodyData) {
  const customer = await stripe.customers.create({
    name: "",
    email: "",
    metadata: {
      Logins: 1,
      "Last Login": bodyData.data["Last Login"],
      "Last Session": bodyData.data["Last Session"],
      Trades: 0,
      "Shared Trades": 0,
      Tier: "Free",
      "Storage Used": `2.94 KB`, // default data usage
    },
  });
  if (!customer) {
    throw (`Didn't create customer.`)
  }
  return customer;
};
