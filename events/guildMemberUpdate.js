module.exports = {
	name: "guildMemberUpdate",
	async execute(oldMember, newMember) {
		console.log(oldMember, newMember);
    
    //var defaultHost = "https://forum.citydao.io/";
    
    /* 
    / Grab object for the new role
    / newRoleId = ID of the changed Role
    / newRoleName = Name of the changed Role
    */
    var newRole = newMember.roles.cache.difference(oldMember.roles.cache).last();
    console.log(newRole);
    var newRoleId = newRole.id;
    var newRoleName = newRole.name; 

    // check whether we added or removed roles
    newMemberSize = newMember.roles.cache.size;
    oldMemberSize = oldMember.roles.cache.size;
    if(newMemberSize > oldMemberSize) {
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
    //  return [...diffRole(arr1, arr2), ...diffRole(arr2, arr1)];
    //
    //  function diff(a, b) {
    //    return a.filter(item => b.indexOf(item) === -1);
    //  }
    // }

	},
};