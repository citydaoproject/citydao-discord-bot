const { Client, Events, GatewayIntentBits, Partials } = require("discord.js");
const axios = require("axios");
const axiosThrottle = require("axios-request-throttle");

axiosThrottle.use(axios, { requestsPerSecond: 1 });

// Get CityDAO Guild
const SERVER_ID = "860356969521217536";

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

  const guild = c.guilds.cache.get(SERVER_ID);

  console.log(`guilds: ${guild}`);

  // https://stackoverflow.com/questions/70282579/how-to-get-all-of-the-members-of-a-guild-with-a-certain-role-in-discord-js-v13
  guild.members
    .fetch()
    .then(async (members) => {
      // Fetch all members with a certain role in discord
      const role = guild.roles.cache.find((r) => r.name === "Citizen"); //the role to check
      const roleMembers = members.filter((m) => m.roles.cache.has(role.id)); // array of user IDs who have the role

      const discordRoleMembers = roleMembers.map((m) => ({
        id: m.user.id,
        username: m.user.username,
      }));

      ////////////////////////////////////////////////////////////////////////////////
      // Get all members in discourse group
      const getConfig = {
        method: "get",
        url: "https://forum.citydao.io/groups/discord_citizen/members.json?limit=1000",
        header: {
          "Api-Key": process.env.API_KEY,
          "Api-Username": process.env.API_USERNAME,
          "Accept-Encoding": "gzip, deflate, br",
          "Content-Type": "application/json",
        },
      };

      const respone = await axios(getConfig);

      const discourseGroupMembers = respone.data.members.map((m) => ({
        id: m.id,
        username: m.username,
      }));

      /////////////////////////////////////////////////////////////////////////////////

      // create discourse object with everyone in the discord role
      const discordDiscourseMapping = [];
      for (const discordMember of discordRoleMembers) {
        let discourseObject = {};
        const memberId = discordMember.id;
        const memberName = discordMember.username;

        const getConfig = {
          method: "get",
          url: `https://forum.citydao.io/u/by-external/discord/${memberId}.json?limit=1000`,
          headers: {
            "Api-Key": process.env.API_KEY,
            "Api-Username": process.env.API_USERNAME,
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/json",
          },
        };

        try {
          const response = await axios(getConfig);

          discourseObject["id"] = response.data.user.id;
          discourseObject["username"] = response.data.user.username;
          discourseObject["isInGroup"] = response.data.user.groups.some(
            (obj) => obj.id === 77
          );

          discordDiscourseMapping.push(discourseObject);
        } catch (error) {
          if (error?.response?.code === 429) {
            console.log("Rate limited, waiting 10 seconds");
          }

          if (error?.response?.code === 404) {
            console.log("User not found, skipping");
          }

          console.log(
            `User ${memberName} and userId ${memberId}": Get Error => ${error?.response?.data?.errors}`
          );
        }
      }

      console.log(discordDiscourseMapping);

      // delete all members from discourse group that are not in the discord

      const discourseMappingIdList = discordDiscourseMapping.map((m) => m.id);
      let deleteRoles = discourseGroupMembers.filter(
        (x) => !discourseMappingIdList.includes(x.id)
      );

      deleteRoles = deleteRoles.map((m) => m.username).join(",");

      // format delete data

      const deleteData = JSON.stringify({
        usernames: deleteRoles,
      });

      if (deleteRoles) {
        const deleteConfig = {
          method: "delete",
          url: "https://forum.citydao.io/groups/77/members.json?limit=1000",
          headers: {
            "Api-Key": process.env.API_KEY,
            "Api-Username": process.env.API_USERNAME,
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/json",
          },
          data: deleteData,
        };

        try {
          const response = await axios(deleteConfig);
        } catch (error) {
          console.log(error.response.data.errors);
        }
      }

      // Add discourse group membership tht are not in the discourse group

      const discourseGroupMembersIdList = discourseGroupMembers.map(
        (m) => m.id
      );

      let addRoles = discordDiscourseMapping.filter(
        (x) => !discourseGroupMembersIdList.includes(x.id)
      );

      addRoles = addRoles.map((m) => m.username).join(",");
      // addRoles = addRoles.map((m) => m.username);

      const putData = JSON.stringify({
        usernames: addRoles,
      });

      if (addRoles) {
        const putConfig = {
          method: "put",
          url: "https://forum.citydao.io/groups/77/members.json?limit=1000",
          headers: {
            "Api-Key": process.env.API_KEY,
            "Api-Username": process.env.API_USERNAME,
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/json",
          },
          data: putData,
        };

        try {
          const response = await axios(putConfig);
        } catch (error) {
          console.log(error?.response?.data?.errors);
        }
      }

      process.exit();
    })

    .catch(console.error);
});

client.login(process.env.TOKEN);

// TODO: Convert Promise to Async/Await
