const DButils = require("./DButils");
const bcrypt = require("bcryptjs");

async function validUsername(username){
  const users = await DButils.execQuery(
    "SELECT username FROM dbo.users"
  );
  if (users.find((x) => x.username === username)){
    return false
  }
  return true
}

async function addNewUser(username,firstname,lastname,password,email,link,country){
  const user_id = await DButils.execQuery(
    `INSERT INTO dbo.users (username, firstname, lastname, password, email, link, country)
     VALUES ('${username}', '${firstname}','${lastname}',
      '${password}', '${email}', '${link}','${country}');
      SELECT SCOPE_IDENTITY() as id`
  );
  await DButils.execQuery(
    `INSERT INTO dbo.Roles (userId, roleId)
     VALUES ('${user_id[0].id}', '${process.env.fanRole}')`
  )
}

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

async function getUserIdByUsername(username){
  const user = (
    await DButils.execQuery(
      `SELECT * FROM dbo.users WHERE username = '${username}'`
    )
  )[0];
  return user.userId
}

function hashPassword(password){
  return bcrypt.hashSync(
    password,
    parseInt(process.env.bcrypt_saltRounds)
  );
}

async function isValidSession(user_id){
    const users = await DButils.execQuery(`SELECT userId FROM dbo.users WHERE userId = '${user_id}'`)
    if (users.find((user) => user.userId === user_id)) {
        return true
    }
    return false
}

async function isAssociationUser(user_id){
  const user_roles = await DButils.execQuery(`SELECT roleId FROM dbo.Roles WHERE userId = '${user_id}'`)
  if (user_roles.find((role) => role.roleId == process.env.associationUserRole)) {
    return true
  }
  return false
}

  exports.isAssociationUser = isAssociationUser;
  exports.isValidSession = isValidSession;
  exports.hashPassword = hashPassword;
  exports.getUserIdByUsername = getUserIdByUsername;
  exports.validLoginDetails = validLoginDetails;
  exports.addNewUser = addNewUser;
  exports.validUsername = validUsername;