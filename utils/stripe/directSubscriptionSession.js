const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function createDirectSession(bodyData) {
  const priceId = bodyData.data["priceId"];
  const success_url = bodyData.data["success_url"];
  const cancel_url = bodyData.data["cancel_url"];
  const customerId = bodyData.data["customerId"];

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
      customer_email: customerId,

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
