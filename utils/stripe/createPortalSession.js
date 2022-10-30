const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function createPortalSession(bodyData) {
  const customerId = bodyData.data["customerId"];
  const returnUrl = bodyData.data["returnURL"];
  let session = "";
  try {
    session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    console.log(session)
  } catch {
    if (!session) {
      return `Invalid session`;
    }
  }
  return session;
};
