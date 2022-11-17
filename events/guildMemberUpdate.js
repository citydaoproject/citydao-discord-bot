module.exports = {
	name: "guildMemberUpdate",
	async execute(oldMember, newMember) {
		//console.log(oldMember, newMember);
    
    //var defaultHost = "https://forum.citydao.io/";
    
    /* 
    / Grab object for the new role
    / newRoleId = ID of the changed Role
    / newRoleName = Name of the changed Role
    */
    var newRole = newMember.roles.cache.difference(oldMember.roles.cache).last();
    var newRoleId = newRole.id;
    var newRoleName = newRole.name; 
		//console.log(newRole);
		console.log(`Role ID: ${newRoleId}`);
		console.log(`Role Name: ${newRoleName}`);

		console.log(newMember.roles.cache);

    /* 
    / MemberNickName = Discord nickname of the current user (string)
    / MemberId = Discord ID of the current user (snowflake)
    / MemberName = Discord username (if no username then nickname) of the current user (string)
    */ 
    var MemberNickName = newMember.nickname;
    var MemberId = newMember.id;
    var MemberName = newMember.displayName;
    console.log(`Nickname: ${MemberNickName}`);
    console.log(`ID: ${MemberId}`);
    console.log(`Name: ${MemberName}`);

    // check whether we added or removed roles
    newMemberSize = newMember.roles.cache.size;
    oldMemberSize = oldMember.roles.cache.size;
		console.log(`new size: ${newMemberSize}`);
		console.log(`old size: ${oldMemberSize}`);
		// needed to +1 for oldMemberSize due to @everyone role in discord
    if(newMemberSize > oldMemberSize+1) {
      // add logic for added role
      console.log("role added");
    } else {
      // add logic for removed role
      console.log("role removed");
    };
    // get user name (finish logic)
    // user = `${defaultHost}/admin/users`

    // function to compare roles
    //function diffRole(arr1, arr2) {
    //  return [...diff(arr1, arr2), ...diff(arr2, arr1)];
    //
    //  function diff(a, b) {
    //    return a.filter(item => b.indexOf(item) === -1);
    //  }
    // }

	},
};
