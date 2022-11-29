const axios = require("axios");
let counter = 1;

function checker(a, b) {
	const oldMemberSize = a.roles.cache.size;
	const newMemberSize = b.roles.cache.size;
	console.log(`old size: ${oldMemberSize}`);
	console.log(`new size: ${newMemberSize}`);

	/* 
/ Note: 
/ At BOT restart OldMember will only come with the @everyone role.
/ calling fetch() on partial completes the structure... which is NewMember
/ This means oldMemberSize and newMemberSize will be the same on BOT start.
/ Quick fix:
/ 1. if(newMemberSize >= oldMemberSize)
/   - first bot event will always be "role added" action.
/   - subsequent events will behave normally.
/ 
/ 2. if(newMemberSize > oldMemberSize)
/   - first bot event will always be a "role removed" action.
/   - subsequent events will be have normally.
*/
	if (newMemberSize >= oldMemberSize) {
		// add logic for added role
		console.log("role added");
		return 1;
	} else {
		// add logic for removed role
		console.log("role removed");
		return 0;
	}
}

function addRemoveRole(url, headers, data, putData, postUrl, newRoleName, counter) {
	console.log(postUrl);
	axios
		.get(url)
		// Check username exist on discourse
		.then((res) => {
			console.log(res.status);
			// User found
			// Add user to the group if they were added to the role
			if (counter == 1) {
				axios
					.put(postUrl, putData, {
						headers: headers,
					})
					.then((res) => {
						console.log(
							`User added to ${newRoleName}.`,
							res.status
						);
					})
					.catch((error) => {
						console.log(error);
					});
			} else {
				// Remove user from the group if they were removed from the role
				axios
					.delete(postUrl, {
						params: data,
						headers: headers,
					})
					.then((res) => {
						console.log(
							`User removed from ${newRoleName}`,
							res.status
						);
					})
					.catch((error) => {
						console.log(error);
					});
			}
		})
		.catch((error) => {
			console.error("Username does not exist on Discourse", error);
		});
}

module.exports = { checker, addRemoveRole };
