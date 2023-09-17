const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function updateCustomer(bodyData) {
  const updatecustomerId = bodyData.data.customerId;
  let updatedCustomer = "";
  console.log("function", bodyData);

  try {
    updatedCustomer = await stripe.customers.update(updatecustomerId, {
      name: bodyData.data.name,
      email: bodyData.data.email,
      metadata: {
        Logins: bodyData.data["Logins"],
        "Last Login": bodyData.data["Last Login"],
        "Last Session": bodyData.data["Last Session"],
        Trades: bodyData.data["Trades"],
        "Shared Trades": bodyData.data["Shared Trades"],
        Sessions: bodyData.data["Sessions"],
        "Storage Used": bodyData.data["Storage Used"],
        Channel: bodyData.data["Channel"],
        IPv4Address: bodyData.data["IPv4Address"],
        UserAgent: bodyData.data["UserAgent"],
        Campaign: bodyData.data["Campaign"],
        auth0id: bodyData.data["auth0id"],
      },
    });
  } catch {
    if (!updatedCustomer) {
      return `Invalid Customer`;
    }
  }

  return updatedCustomer;
};
