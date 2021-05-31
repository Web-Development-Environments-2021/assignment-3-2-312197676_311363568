var express = require("express");
var router = express.Router();
const auth_utils = require("./utils/auth_utils");


router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    const username = req.body.username
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const password = req.body.password
    const email = req.body.email
    const country = req.body.country
    const link = req.body.link

    const valid_username = await auth_utils.validUsername(username)
    if (!valid_username)
      throw { status: 409, message: "Username taken" };

    //hash the password
    const hash_password = auth_utils.hashPassword(password)

    // add the new username
    await auth_utils.addNewUser(username,firstname,lastname,hash_password,email,link,country)

    res.status(201).send("user created");
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    valid_details = await auth_utils.validLoginDetails(req.body.username,req.body.password)

    if (!valid_details) {
      throw { status: 401, message: "Username or Password incorrect" };
    }
    user_id = await auth_utils.getUserIdByUsername(req.body.username)
    // Set cookie
    req.session.user_id = user_id;
    req.session.lastQueryResults=undefined;

    // return cookie
    res.status(200).send("login succeeded");
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send("logout succeeded");
});

module.exports = router;
