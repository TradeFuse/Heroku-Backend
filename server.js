"use strict";
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const discordBot = require("./modules/discordBot");
const createCustomer = require("./utils/createStripeCustomer");
const getCustomer = require("./utils/getStripeCustomer");
const updateCustomer = require("./utils/updateStripeCustomer");
const initializeRobinhood = require("./brokerHandling/robinhood/initializeRobinhood");
const getRobinhoodOrders = require("./brokerHandling/robinhood/getRobinhoodOrders");
const getNewRobinhoodOrders = require("./brokerHandling/robinhood/getNewRobinhoodOrders");
const getOptionInstrumentRobinhood = require("./brokerHandling/robinhood/getOptionInstrument");
const getRobinhoodCryptoOrders = require("./brokerHandling/robinhood/getRobinhoodCryptoInstruments");
const getRobinhoodInstruments = require("./brokerHandling/robinhood/getInstrument");
const getOptionPositionRobinhood = require("./brokerHandling/robinhood/getOptionPosition");
const getAssetData = require("./utils/getAssetData");

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

app.listen(PORT);

app.get("/", (req, res) => {
  res.send("Hello World");
});

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
      default:
        break;

      // code block
    }
  }
});

discordBot();
