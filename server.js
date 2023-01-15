"use strict";
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const discordBot = require("./modules/discordBot");
const createCustomer = require("./utils/stripe/createStripeCustomer");
const getCustomer = require("./utils/stripe/getStripeCustomer");
const updateCustomer = require("./utils/stripe/updateStripeCustomer");
const initializeRobinhood = require("./brokerHandling/robinhood/initializeRobinhood");
const getRobinhoodOrders = require("./brokerHandling/robinhood/getRobinhoodOrders");
const getNewRobinhoodOrders = require("./brokerHandling/robinhood/getNewRobinhoodOrders");
const getOptionInstrumentRobinhood = require("./brokerHandling/robinhood/getOptionInstrument");
const getRobinhoodCryptoOrders = require("./brokerHandling/robinhood/getRobinhoodCryptoInstruments");
const getRobinhoodInstruments = require("./brokerHandling/robinhood/getInstrument");
const getOptionPositionRobinhood = require("./brokerHandling/robinhood/getOptionPosition");
const getAssetData = require("./utils/getAssetData");
const createSession = require("./utils/stripe/createStripeSession");
const createPortalSession = require("./utils/stripe/createPortalSession");
const getRiskFreeRate = require("./utils/getRiskFreeRate");
const cron = require("node-cron");
const AsyncLock = require("async-lock");
let lock = new AsyncLock();

let riskFreeRate = { rate: 2.0 };

const getRiskFreeRateEveryHour = async () => {
  await lock.acquire("lockKey", async () => {
    try {
      const gotRiskFreeRate = await getRiskFreeRate();
      riskFreeRate = { rate: gotRiskFreeRate };
      console.log(riskFreeRate);
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

cron.schedule("00 12 * * * *", async () => {
  console.log("yo");
  await getRiskFreeRateEveryHour();
});

app.listen(PORT);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys

app.post("/", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST");
    res.status(204).send("");
  } else {
    switch (bodyData.action) {
      case "createStripeCustomer":
        const createdCustomer = await createCustomer(bodyData);
        res.json(createdCustomer);
        break;
      case "getStripeCustomer":
        const customerId = bodyData.data.customerId;
        const retrievedCustomer = await getCustomer(customerId);
        res.json(retrievedCustomer);
        break;
      case "updateStripeCustomer":
        const updatedCustomer = await updateCustomer(bodyData);
        res.json(updatedCustomer);
        break;
      case "createStripeSession":
        const createdSession = await createSession(bodyData);
        res.json(createdSession);
        break;
      case "createStripePortalSession":
        const createdPortalSession = await createPortalSession(bodyData);
        res.json(createdPortalSession);
        break;
      case "initializeRobinhood":
        const initializedRobinhood = await initializeRobinhood(bodyData, req);
        const responseInitRH = {
          initializedRobinhood: initializedRobinhood,
        };
        res.json(responseInitRH);
        break;
      case "getRobinhoodOrders":
        const gotRobinhood = await getRobinhoodOrders(bodyData, req);
        const responsegotRH = {
          gotRobinhood: gotRobinhood,
        };
        res.json(responsegotRH);
        break;
      case "getNewRobinhoodOrders":
        const gotNewRobinhood = await getNewRobinhoodOrders(bodyData, req);
        const responsegotNewRH = {
          gotNewRobinhood: gotNewRobinhood,
        };
        res.json(responsegotNewRH);
        break;
      case "getRobinhoodInstruments":
        const gotRobinhoodInstruments = await getRobinhoodInstruments(
          bodyData,
          req
        );
        const responsegotRHInstruments = {
          gotRobinhoodInstruments: gotRobinhoodInstruments,
        };
        res.json(responsegotRHInstruments);
        break;
      case "getRobinhoodOptionsInstruments":
        const gotRobinhoodOptionInstruments =
          await getOptionInstrumentRobinhood(bodyData, req);
        const responsegotRHOptionInstruments = {
          gotRobinhoodOptionInstruments: gotRobinhoodOptionInstruments,
        };
        res.json(responsegotRHOptionInstruments);
        break;
      case "getRobinhoodOptionsPosition":
        const gotRobinhoodOptionPosition = await getOptionPositionRobinhood(
          bodyData,
          req
        );
        const responsegotRHOptionPosition = {
          gotRobinhoodOptionPosition: gotRobinhoodOptionPosition,
        };
        res.json(responsegotRHOptionPosition);
        break;
      case "getRobinhoodCryptoInstruments":
        const gotRobinhoodCryptoInstruments = await getRobinhoodCryptoOrders(
          bodyData,
          req
        );
        const responsegotRHCryptoInstruments = {
          gotRobinhoodCryptoInstruments: gotRobinhoodCryptoInstruments,
        };
        res.json(responsegotRHCryptoInstruments);
        break;
      case "getAssetData":
        const gotAssetData = await getAssetData(bodyData, req);
        const responseAssetData = {
          asset: gotAssetData,
        };
        res.json(responseAssetData);
        break;
      case "getRiskFreeRate":
        console.log(riskFreeRate);

        res.json(riskFreeRate);
        break;
      default:
        break;

      // code block
    }
  }
});

app.post("/webhook", async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  switch (eventType) {
    case "checkout.session.completed":
      console.log("checkoiut completed");
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      break;
    case "invoice.paid":
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      break;
    case "invoice.payment_failed":
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      break;
    default:
    // Unhandled event type
  }

  res.sendStatus(200);
});

discordBot();
