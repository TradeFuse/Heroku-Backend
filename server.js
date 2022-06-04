"use strict";

const express = require("express");
const cors = require('cors');

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
  res.json({requestBody: req.body});

});

app.post("/createStripeCustomer", (req, res) => {
  res.send("create stripe customer");
});

console.log(`Running on http://${PORT}`);
