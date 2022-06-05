const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function updateCustomer(bodyData) {
  const updatecustomerId = bodyData.data.customerId;
  const customer = await stripe.customers.update(updatecustomerId, {
    name: bodyData.data.update.name,
    email: bodyData.data.update.email,
    metadata: {
      Logins: bodyData.data.update.metadata["Logins"],
      "Last Login": bodyData.data.update.metadata["Last Login"],
      Trades: bodyData.data.update.metadata["Trades"],
      "Shared Trades": bodyData.data.update.metadata["Shared Trades"],
      Tier: bodyData.data.update.metadata["Tier"],
      "Storage Used": bodyData.data.update.metadata["Storage Used"],
    },
  });
  return customer;
};
