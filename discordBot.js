"use strict";
const { Client, Intents } = require("discord.js");
const discordClient = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
module.exports = async function discordBot() {
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
}

