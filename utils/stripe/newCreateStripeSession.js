const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function createNewSession(bodyData) {
  const priceId = bodyData.data["priceId"];
  const success_url = bodyData.data["success_url"];
  const cancel_url = bodyData.data["cancel_url"];
  const customerEmail = bodyData.data["customerEmail"];
  const customerName = bodyData.data["customerName"];
  const metadata = bodyData.data["metadata"];
  let session = "";
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
      // the actual Session ID is returned in the query parameter when your customer
      // is redirected to the success page.
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      allow_promotion_codes: true,
      customer_email: customerEmail,
/*       metadata: {
        Logins: "1",
        "Last Login": String(metadata["Last Login"]),
        "Last Session": String(metadata["Last Session"]),
        Trades: "0",
        "Shared Trades": "0",
        Sessions: "1",
        "Storage Used": `2.94 KB`, // default data usage
        Channel: String(metadata["Channel"]),
        IPv4Address: String(metadata["IPv4Address"]),
        UserAgent: String(metadata["UserAgent"]),
        Campaign: String(metadata["Campaign"]),
        auth0id: String(metadata["auth0id"]),
      }, */
      subscription_data: {
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
        trial_period_days: 5,
      },
      payment_method_collection: "always", // requires a credit card
      //payment_method_collection: "if_required",
    });
  } catch (err) {
    if (!session) {
      return `Invalid session`;
    }
  }
  return session;
};
