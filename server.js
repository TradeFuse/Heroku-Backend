"use strict";
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const discordBot = require("./modules/discordBot.js");
const createCustomer = require("./utils/stripe/createStripeCustomer.js");
const getCustomer = require("./utils/stripe/getStripeCustomer.js");
const deleteCustomer = require("./utils/stripe/deleteStripeCustomer.js");
const updateCustomer = require("./utils/stripe/updateStripeCustomer.js");
const initializeRobinhood = require("./brokerHandling/robinhood/initializeRobinhood.js");
const getRobinhoodOrders = require("./brokerHandling/robinhood/getRobinhoodOrders.js");
const getNewRobinhoodOrders = require("./brokerHandling/robinhood/getNewRobinhoodOrders.js");
const getOptionInstrumentRobinhood = require("./brokerHandling/robinhood/getOptionInstrument.js");
const getRobinhoodCryptoOrders = require("./brokerHandling/robinhood/getRobinhoodCryptoInstruments.js");
const getRobinhoodInstruments = require("./brokerHandling/robinhood/getInstrument.js");
const getOptionPositionRobinhood = require("./brokerHandling/robinhood/getOptionPosition.js");
const getAssetData = require("./utils/getAssetData.js");
const createSession = require("./utils/stripe/createStripeSession.js");
const createNewSession = require("./utils/stripe/newCreateStripeSession.js");
const createPortalSession = require("./utils/stripe/createPortalSession.js");
const getRiskFreeRate = require("./utils/getRiskFreeRate.js");
const handleOpenAIRequest = require("./utils/handleOpenAIRequests.js");
const cron = require("node-cron");
const cancelAllSubscriptions = require("./utils/stripe/cancelAllSubscriptions.js");
const updateFacebookAdd = require("./Ads/facebook.js");
const AsyncLock = require("async-lock");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

let lock = new AsyncLock();

let riskFreeRate = { rate: 2.0 };

const getRiskFreeRateEveryHour = async () => {
  await lock.acquire("lockKey", async () => {
    try {
      const gotRiskFreeRate = await getRiskFreeRate();
      riskFreeRate = gotRiskFreeRate;
    } catch (error) {
      console.log(error);
    }
  });
};

// Constants
const PORT = process.env.PORT || 3000;
//const HOST = "0.0.0.0";

// App
const app = express();
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json());

cron.schedule("00 17 * * * *", async () => {
  await getRiskFreeRateEveryHour();
});
getRiskFreeRate().then((res) => {
  riskFreeRate = res;
});

app.listen(PORT);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys

// Handle Open AI message
app.post("/handleOpenAImessage", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const handleOpenAIRequester = await handleOpenAIRequest(bodyData);
    res.json(handleOpenAIRequester);
  }
});

// create Stripe customer
app.post("/createStripeCustomer", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const createdCustomer = await createCustomer(bodyData);
    res.json(createdCustomer);
  }
});

// get Stripe customer
app.post("/getStripeCustomer", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const customerId = bodyData.data.customerId;
    const retrievedCustomer = await getCustomer(customerId);
    res.json(retrievedCustomer);
  }
});

// Cancell all stripe subscriptions
app.post("/cancelAllSubscriptions", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const subArray = bodyData.data.subArray;
    const cancelsubs = await cancelAllSubscriptions(subArray);
    res.json(cancelsubs);
  }
});

// Delete Stripe Customer
app.post("/deleteStripeCustomer", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const customerIdd = bodyData.data.customerId;
    const deletedCustomer = await deleteCustomer(customerIdd);
    res.json(deletedCustomer);
  }
});

// Delete Stripe Customer
app.post("/updateStripeCustomer", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const updatedCustomer = await updateCustomer(bodyData);
    res.json(updatedCustomer);
  }
});

// Require Credit Card Create Stripe Session
app.post("/newcreateStripeSession", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const createdSession = await createNewSession(bodyData);
    res.json(createdSession);
  }
});

// Create Stripe Session
app.post("/createStripeSession", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const createdSession = await createSession(bodyData);
    res.json(createdSession);
  }
});

// Create Stripe portal Session
app.post("/createStripePortalSession", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const createdPortalSession = await createPortalSession(bodyData);
    res.json(createdPortalSession);
  }
});

// Initialize Robinhood
app.post("/initializeRobinhood", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const initializedRobinhood = await initializeRobinhood(bodyData, req);
    const responseInitRH = {
      initializedRobinhood: initializedRobinhood,
    };
    res.json(responseInitRH);
  }
});

// Get Robinhood Orders
app.post("/getRobinhoodOrders", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const gotRobinhood = await getRobinhoodOrders(bodyData, req);
    const responsegotRH = {
      gotRobinhood: gotRobinhood,
    };
    res.json(responsegotRH);
  }
});

// Get New Robinhood Orders
app.post("/getNewRobinhoodOrders", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const gotNewRobinhood = await getNewRobinhoodOrders(bodyData, req);
    const responsegotNewRH = {
      gotNewRobinhood: gotNewRobinhood,
    };
    res.json(responsegotNewRH);
  }
});

// Get Robinhood Instruments
app.post("/getRobinhoodInstruments", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const gotRobinhoodInstruments = await getRobinhoodInstruments(
      bodyData,
      req
    );
    const responsegotRHInstruments = {
      gotRobinhoodInstruments: gotRobinhoodInstruments,
    };
    res.json(responsegotRHInstruments);
  }
});

// Get Robinhood Options Instruments
app.post("/getRobinhoodOptionsInstruments", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const gotRobinhoodOptionInstruments = await getOptionInstrumentRobinhood(
      bodyData,
      req
    );
    const responsegotRHOptionInstruments = {
      gotRobinhoodOptionInstruments: gotRobinhoodOptionInstruments,
    };
    res.json(responsegotRHOptionInstruments);
  }
});

// Get Robinhood Options Instruments
app.post("/getRobinhoodOptionsPosition", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const gotRobinhoodOptionPosition = await getOptionPositionRobinhood(
      bodyData,
      req
    );
    const responsegotRHOptionPosition = {
      gotRobinhoodOptionPosition: gotRobinhoodOptionPosition,
    };
    res.json(responsegotRHOptionPosition);
  }
});

// Get Robinhood Crypto Instruments
app.post("/getRobinhoodCryptoInstruments", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const gotRobinhoodCryptoInstruments = await getRobinhoodCryptoOrders(
      bodyData,
      req
    );
    const responsegotRHCryptoInstruments = {
      gotRobinhoodCryptoInstruments: gotRobinhoodCryptoInstruments,
    };
    res.json(responsegotRHCryptoInstruments);
  }
});

// Get Risk Free Rate
app.post("/getRiskFreeRate", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    console.log(riskFreeRate);
    res.json(riskFreeRate);
  }
});

// Get Asset Data
app.post("/getAssetData", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    const gotAssetData = await getAssetData(bodyData, req);
    const responseAssetData = {
      asset: gotAssetData,
    };
    res.json(responseAssetData);
  }
});

app.post("/mt4Orders", async (req, res) => {
  const bodyData = req.body;
  console.log("Inserting New Tick");

  var tick = req.body;
  console.log(">" + JSON.stringify(tick, null, 4));
});

// Receive Facebook Ads Info
/* app.post("/facebookAdHandler", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    await updateFacebookAdd(bodyData, req);
  }
});
 */
// This is Stripe webhook stuff
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    let event = request.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        console.log("checkout.session.completed");
        console.log(checkoutSessionCompleted);

        // Then define and call a function to handle the event checkout.session.completed
        break;
      case "invoice.payment_failed":
        const invoicePaymentFailed = event.data.object;
        // Then define and call a function to handle the event invoice.payment_failed
        if (invoicePaymentFailed.billing_reason === "subscription_cycle") {
          // Check if it was a trial by comparing the dates
          const currentPeriodStart = invoicePaymentFailed.period_start;
          const currentPeriodEnd = invoicePaymentFailed.period_end;
          const subscription = await stripe.subscriptions.retrieve(
            invoicePaymentFailed.subscription
          );
          if (
            subscription.trial_end === currentPeriodStart &&
            subscription.trial_start === currentPeriodEnd
          ) {
            const yourCustomFunction = (customer) => {
              console.log(customer);
            };
            // If it was a trial and it failed, you can call your custom function here
            yourCustomFunction(invoicePaymentFailed.customer);
          }
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

discordBot();
