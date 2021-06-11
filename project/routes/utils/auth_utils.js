const DButils = require("./DButils");
const bcrypt = require("bcryptjs");

/**
 * The function check if username is available to use return true if not used.
 * @param {string} username 
 * @returns 
 */
async function validUsername(username){
  const users = await DButils.execQuery(
    "SELECT username FROM dbo.users"
  );
  if (users.find((x) => x.username === username)){
    return false
  }
  return true
}

async function getUserRoles(user_id){
  try{
    let user_roles_collection = []
    const user_roles = await DButils.execQuery(
    `SELECT roleId FROM dbo.roles WHERE userId=${user_id}`
  )
    user_roles.map((role) => {user_roles_collection.push(role.roleId)})
    return user_roles_collection
  }catch(e){
    return []
  }

}

/**
 * The function add new User to the system
 * @param {string} username 
 * @param {string} firstname 
 * @param {string} lastname 
 * @param {string} password 
 * @param {string} email 
 * @param {string} link 
 * @param {string} country 
 */
async function addNewUser(username,firstname,lastname,password,email,link, country){
  const user_id = await DButils.execQuery(
    `INSERT INTO dbo.users (username, firstname, lastname, password, email, link, country)
    VALUES ('${username}', '${firstname}','${lastname}', '${password}', '${email}', '${link}', '${country}');
    SELECT SCOPE_IDENTITY() as id`
  );
  await DButils.execQuery(
    `INSERT INTO dbo.Roles (userId, roleId)
     VALUES ('${user_id[0].id}', '${process.env.fanRole}')`
  )
}

/**
 * The function checkes that the username exist and the password are matched.
 * @param {string} username 
 * @param {string} password 
 * @returns 
 */
async function validLoginDetails(username, password){
  const user = (
    await DButils.execQuery(
      `SELECT * FROM dbo.users WHERE username = '${username}'`
    )
  )[0];

  // check that username exists & the password is correct
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return false
  }
  return true
}

/**
 * The function return username's ID.
 * @param {string} username 
 * @returns 
 */
async function getUserIdByUsername(username){
  const user = (
    await DButils.execQuery(
      `SELECT * FROM dbo.users WHERE username = '${username}'`
    )
  )[0];
  return user.userId
}

/**
 * The function encryp the password and returns it
 * @param {string} password 
 * @returns 
 */
function hashPassword(password){
  return bcrypt.hashSync(
    password,
    parseInt(process.env.bcrypt_saltRounds)
  );
}

/**
 * The function check that user_id exist.
 * @param {number} user_id 
 * @returns 
 */
async function isValidSession(user_id){
    const users = await DButils.execQuery(`SELECT userId FROM dbo.users WHERE userId = '${user_id}'`)
    if (users.find((user) => user.userId === user_id)) {
        return true
    }
    return false
}

/**
 * The function checks if user_id role is associationUserRole
 * @param {number} user_id 
 * @returns 
 */
async function isAssociationUser(user_id){
  const user_roles = await DButils.execQuery(`SELECT roleId FROM dbo.Roles WHERE userId = '${user_id}'`)
  if (user_roles.find((role) => role.roleId == process.env.associationUserRole)) {
    return true
  }
  return false
}

  exports.getUserRoles = getUserRoles;
  exports.isAssociationUser = isAssociationUser;
  exports.isValidSession = isValidSession;
  exports.hashPassword = hashPassword;
  exports.getUserIdByUsername = getUserIdByUsername;
  exports.validLoginDetails = validLoginDetails;
  exports.addNewUser = addNewUser;
  exports.validUsername = validUsername;