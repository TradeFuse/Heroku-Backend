const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function createCustomer(bodyData) {
  let customer = "";
  try {
    // create customer
    customer = await stripe.customers.create({
      name: "",
      email: "",
      metadata: {
        Logins: 1,
        "Last Login": bodyData.data["Last Login"],
        "Last Session": bodyData.data["Last Session"],
        Trades: 0,
        "Shared Trades": 0,
        Sessions: 1,
        "Storage Used": `2.94 KB`, // default data usage
      },
    });

    // subscribe them to stripe free
/*     await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: "price_1L2hzIJEnF6qjMZiYVeo5pXg" }],
    }); */
  } catch {
    if (!customer) {
      return `Invalid Customer`;
    }
  }
  return customer;
};
