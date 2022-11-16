const fs = require("node:fs");
const path = require("node:path");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { token } = require("./config.json");

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
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