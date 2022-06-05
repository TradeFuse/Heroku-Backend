const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const moment = require("moment/moment");

module.exports = async function createCustomer() {
  let today = new Date().toISOString();
  const customer = await stripe.customers.create({
    name: "",
    email: "",
    metadata: {
      Logins: 1,
      "Last Login": String(moment(today).local().format("MM/DD/YYYY hh:mm:ss A")),
      Trades: 0,
      "Shared Trades": 0,
      Tier: "Free",
      "Storage Used": `0 KB`,
    },
  });
  return customer
};
