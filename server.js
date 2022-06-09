"use strict";

const express = require("express");
const cors = require("cors");
const discordBot = require("./modules/discordBot");
const createCustomer = require("./utils/createStripeCustomer");
const getCustomer = require("./utils/getStripeCustomer");
const updateCustomer = require("./utils/updateStripeCustomer");

// Constants
const PORT = process.env.PORT || 5000;
//const HOST = "0.0.0.0";

// App
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors());
app.use(express.json());
app.listen(PORT);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/", async (req, res) => {
  const bodyData = req.body;
  if (req.method == "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type");
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
      default:
        break;

      // code block
    }
  }
});

discordBot();
