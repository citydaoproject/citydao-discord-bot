const axios = require("axios");
const { Api_Key, Api_Username } = require("../config.json");
const {
	discord_citizen,
	discord_founding,
} = require("../groups.json");
const { checker, addRemoveRole } = require("../utils.js");

module.exports = {
	name: "guildMemberUpdate",
	async execute(oldMember, newMember) {

		const defaultHost = "forum.citydao.io";

		/*
    / Counter to check whether role was ADDED or REMOVED.
		/ Counter = 1 (role is added)
		/ Counter = 0 (role is removed)
		/ Default behavior: bot will always consider the first event
		/ after start/restart on each user as a ROLE ADDED event.
    */
		let counter = 1;

		// Check to see if the structure we called on is partial or not.
		if (oldMember.partial) {
			// If it's partial we will retrieve the missing data from the API.
			// Note: this will prevent empty roles on oldMember after bot restart.
			oldMember
				.fetch()
				.then((fullMember) => {
					counter = checker(fullMember, newMember);
				})
				.catch((error) => {
					console.log(error);
				});
		} else {
			counter = checker(oldMember, newMember);
		}

		/* 
    / For future references:
    / memberNickName = Discord nickname of the current user (string).
    / memberId = Discord ID of the current user (snowflake).
    / memberName = Discord username (if no username then nickname) of the current user (string).
    */
    const { displayName: memberName,
            nickname: memberNickName,
            id: memberId 
          } = newMember; 

		// Check whether discord user name exist on discourse/forum.
		// API endpoint "Get a single user by username".
		// METHOD: GET
		//
		//
		const url = `https://${defaultHost}/u/${memberName}.json`;
		console.log(url);

		const data = {
			usernames: memberName,
		};
		const putData = JSON.stringify(data);

		const headers = {
			"Content-Type": "application/json",
			"Api-Key": Api_Key,
			"Api-Username": Api_Username,
		};

		/* 
    / Grab object for the new role
    / newRoleId = ID of the changed Role
    / newRoleName = Name of the changed Role
    */
		const newRole = newMember.roles.cache
			.difference(oldMember.roles.cache)
			.last();
		const { id: newRoleId, name: newRoleName } = newRole;

		console.log(`Role ID: ${newRoleId}`);
		console.log(`Role Name: ${newRoleName}`);

		if (newRoleName == "Founding Citizen") {
			const postUrl = `https://${defaultHost}/groups/${discord_founding}/members.json`;
			addRemoveRole(url, headers, data, putData, postUrl, newRoleName, counter);
		} else if (newRoleName == "Citizen") {
			const postUrl = `https://${defaultHost}/groups/${discord_citizen}/members.json`;
			addRemoveRole(url, headers, data, putData, postUrl, newRoleName, counter);
		}
	},
};
