const fs = require("node:fs");
const path = require("node:path");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { token, Api_Key, Api_Username } = require("./config.json");

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
	// Need to intialize Partials.GuildMember otherwise guildMemberUpdate
	// will not fire for uncached members...
	// 
	// Otherwise this behavior:
	// When the bot first starts up, the first update to a guild member (which
	// should fire guildMemberUpdate) does not happen.

  partials: [
    Partials.GuildMember,
  ],
});

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
		//client.on(event.name, (oldMember, newMember) =>
		//	event.execute(oldMember, newMember)
		//);
	}
}

client.login(token);