"use strict";

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const moment = require("moment/moment");
const { Client, Intents } = require("discord.js");
const discordClient = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

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

app.post("/", async (req, res) => {
  const bodyData = req.body;
  console.log(bodyData);
  let today = new Date().toISOString();
  if (bodyData.action === "createStripeCustomer") {
    const customer = await stripe.customers.create({
      name: "",
      email: "",
      metadata: {
        Logins: 1,
        "Last Login": String(moment(today).format("MM/DD/YYYY hh:mm:ss A")),
        Trades: 0,
        "Shared Trades": 0,
        Tier: "Free",
        "Storage Used": `0 KB`,
      },
    });
    res.json(customer);
  } else if (bodyData.action === "getStripeCustomer") {
    const customerId = bodyData.data.customerId;
    const getcustomer = await stripe.customers.retrieve(customerId);
    res.json(getcustomer);
  } else if (bodyData.action === "updateStripeCustomer") {
  }
});

// ----- DISCORD BOT -----

discordClient.on("ready", () => {
  console.log("Ready.");
});

discordClient.on("guildMemberRemove", function (member) {
  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === "community"
  );
  channel.send(`${member} has left the party.`);
});

discordClient.on("messageDeleteBulk", function (message) {
  const channel = message.guild.channels;
  const usernamebuff = message.author;
  channel
    .find("name", "community")
    .send(`${usernamebuff} is deleting a lot of messages. Looks suspicious.`);
});

discordClient.on("guildMemberAdd", (member) => {
  const role = member.guild.roles.cache.find(
    (role) => role.name === "Community"
  );
  member.roles.add(role);
});

discordClient.on("guildUnavailable", (guild) => {
  const channel = guild.channels.cache.find((ch) => ch.name === "community");
  channel.send(
    `Woah, looks like the ${guild} server is down. Check again later for continuation of awesomeness.`
  );
});

discordClient.login(process.env.DISCORD_LOGIN_KEY);

console.log(`Running on http://${PORT}`);
