const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function createCustomer(bodyData) {
  let customer = "";
  try {
    // create customer
    customer = await stripe.customers.create({
      name: "",
      email: "",
      metadata: {
        Logins: 0,
        "Last Login": bodyData.data["Last Login"],
        "Last Session": bodyData.data["Last Session"],
        Trades: 0,
        "Shared Trades": 0,
        Sessions: 0,
        "Storage Used": `2.94 KB`, // default data usage
        Channel: bodyData.data["Channel"],
        IPv4Address: bodyData.data["IPv4Address"],
        UserAgent: bodyData.data["UserAgent"],
        Campaign: bodyData.data["Campaign"],
      },
    });

    // subscribe them to stripe master
    await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: "price_1NPIvhJEnF6qjMZilSidrLpj" }],
      trial_period_days: 14,
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      },
    });
  } catch {
    if (!customer) {
      return `Invalid Customer`;
    }
  }
  return customer;
};
