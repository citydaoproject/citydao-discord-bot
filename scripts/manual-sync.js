const { Client, Events, GatewayIntentBits, Partials } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  // Need to intialize Partials.GuildMember otherwise guildMemberUpdate
  // will not fire for uncached members...
  //
  // Otherwise this behavior:
  // When the bot first starts up, the first update to a guild member (which
  // should fire guildMemberUpdate) does not happen.

  partials: [Partials.GuildMember],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

  const guild = c.guilds.cache.get("1039885252920873052");

  console.log(`guilds: ${guild}`);

  // https://stackoverflow.com/questions/70282579/how-to-get-all-of-the-members-of-a-guild-with-a-certain-role-in-discord-js-v13
  guild.members
    .fetch()
    .then(async (members) => {
      // Fetch all members with a certain role in discord
      const role = guild.roles.cache.find((r) => r.name === "Citizen"); //the role to check
      const roleMembers = members.filter((m) => m.roles.cache.has(role.id)); // array of user IDs who have the role

      const discordRoleMembers = roleMembers.map((m) => m.user.username);

      // get all members from discourse group

      const getConfig = {
        method: "get",
        url: "https://forum.citydao.io/groups/discord_citizen/members.json",
        header: {
          "Api-Key": process.env.API_KEY,
          "Api-Username": process.env.API_USERNAME,
          "Content-Type": "application/json",
        },
      };

      const respone = await axios(getConfig);

      const discourseMembers = respone.data.members.map((m) => m.username);

      // delete all members from discourse group that are not in the discord

      const deleteRoles = discourseMembers
        .filter((x) => !discordRoleMembers.includes(x))
        .join(",");

      const data = JSON.stringify({
        usernames: deleteRoles,
      });

      if (deleteRoles) {
        const deleteConfig = {
          method: "delete",
          url: "https://forum.citydao.io/groups/77/members.json",
          headers: {
            "Api-Key": process.env.API_KEY,
            "Api-Username": process.env.API_USERNAME,
            "Content-Type": "application/json",
          },
          data: data,
        };

        try {
          const response = await axios(deleteConfig);
        } catch (error) {
          console.log(error.response.data.errors);
        }
      }

      // Add discourse group membership

      const addRoles = discordRoleMembers.filter(
        (x) => !discourseMembers.includes(x)
      );
      for (const memberName of addRoles) {
        const data = JSON.stringify({
          usernames: memberName,
        });

        const putConfig = {
          method: "put",
          url: "https://forum.citydao.io/groups/77/members.json",
          headers: {
            "Api-Key": process.env.API_KEY,
            "Api-Username": process.env.API_USERNAME,
            "Content-Type": "application/json",
          },
          data: data,
        };

        try {
          const response = await axios(putConfig);
        } catch (error) {
          console.log(`User "${memberName}" => ${error.response.data.errors}`);
        }
      }
      process.exit();
    })

    .catch(console.error);
});

console.log("process.env.TOKEN", process.env.TOKEN);

client.login(process.env.TOKEN);

// TODO: Convert Promise to Async/Await
