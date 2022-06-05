const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function updateCustomer(bodyData) {
  const updatecustomerId = bodyData.data.customerId;
  console.log("updateCustomer", bodyData)
  await stripe.customers.update(updatecustomerId, {
    name: bodyData.data.update.name,
    email: bodyData.data.update.email,
    metadata: {
      Logins: bodyData.data.update["Logins"],
      "Last Login": bodyData.data.update["Last Login"],
      Trades: bodyData.data.update["Trades"],
      "Shared Trades": bodyData.data.update["Shared Trades"],
      Tier: bodyData.data.update["Tier"],
      "Storage Used": bodyData.data.update["Storage Used"],
    },
  });
};
