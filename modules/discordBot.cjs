"use strict";
const { Client, Intents } = require("discord.js");
const discordClient = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});
const prefix = require("discord-prefix");
let defaultPrefix = "!";

module.exports = async function discordBot() {
  discordClient.on("ready", () => {
    console.log("Discord bot ready.");
  });

/*   discordClient.on("guildMemberRemove", function (member) {
    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === "logbook"
    );
    channel.send(`${member} has left the party.`);
  });
 */
  discordClient.on("presenceUpdate", (oldPresence, newPresence) => {
    if (oldPresence.activities !== newPresence.activities) {
      const role = newPresence.guild.roles.cache.find(
        (role) => role.name === "Core Team"
      );

      if (role) {
        role.members.forEach((member) => {
          member.setActivity("", { type: "PLAYING" });
        });
      } else {
        console.error("Role not found!");
      }
    }
  });

  discordClient.on("messageDeleteBulk", function (message) {
    const channel = message.guild.channels;
    const usernamebuff = message.author;
    channel
      .find("name", "logbook")
      .send(`${usernamebuff} is deleting a lot of messages. Looks suspicious.`);
  });

  discordClient.on("guildMemberAdd", (member) => {
    const role = member.guild.roles.cache.find(
      (role) => role.name === "Community"
    );
    member.roles.add(role);
  });

  discordClient.on("guildUnavailable", (guild) => {
    const channel = guild.channels.cache.find((ch) => ch.name === "logbook");
    channel.send(
      `Woah, looks like the ${guild} server is down. Check again later for continuation of awesomeness.`
    );
  });

  discordClient.on("messageCreate", (message) => {
    /*     //stop code execution if message is received in DMs
    if (!message.guild) return; */

    //get the prefix for the discord server
    let guildPrefix = prefix.getPrefix(message.guild.id);

    //set prefix to the default prefix if there isn't one
    if (!guildPrefix) guildPrefix = defaultPrefix;

    //rest of the message event
    //let args = message.content.slice(guildPrefix.length).split(" ");
    const channel = message.channel.id;

    if (channel === "983038189092630578") {
      const channelNew = message.guild.channels.cache.find(
        (ch) => ch.name === "user-feedback"
      );

      if (!message.content.startsWith(guildPrefix)) {
      } else {
        const newContent = message.content.substring(1);
        const user = message.author.username;
        channelNew.send(`User: **${user}**, Bug/Feedback: **${newContent}**`);
      }
    }

    return;
  });

  discordClient.login(process.env.DISCORD_LOGIN_KEY);
};
