"use strict";

const express = require("express");
const cors = require('cors');
const stripe = require('stripe')(process.env.PLATFORM_SECRET_KEY);

// Constants
const PORT = process.env.PORT || 80;
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

app.post("/", (req, res) => {
  const bodyData = res.json({requestBody: req.body});
  if (bodyData.requestBody.action === "createStripeCustomer") {
    const customer = await stripe.customers.create({
      name: "",
      email: "",
      metadata: {
        Logins: 1,
        "Last Login": String(moment(today).format("MM/DD/YYYY hh:mm:ss A")),
        Trades: 0,
        "Shared Trades": 0,
        Tier: "Free",
        "Storage Used": `0 KB`
      },
    });
    const resCustomer = res.json(customer);
    res.send(resCustomer);
  }

});

app.post("/createStripeCustomer", (req, res) => {
  res.send("create stripe customer");
});

console.log(`Running on http://${PORT}`);
