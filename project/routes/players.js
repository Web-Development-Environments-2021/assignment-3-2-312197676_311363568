var express = require("express");
var router = express.Router();
const players_utils = require("./utils/players_utils");
var isCookiesOn=false;
router.use(async function (req,res,next){
  req.session ? isCookiesOn=true : isCookiesOn=false;
  next();
})

router.get("/:playerId", async (req, res, next) => {
  try {
    const player_info = await players_utils.getPlayerInfoById(req.params.playerId)
    res.send(player_info);
  } catch (error) {
    next(error);
  }
});

router.get("/search/:playerName", async (req, res, next) => {
  try {
    const players_info = await players_utils.getPlayerInfoByName(
      req.params.playerName
    )
    isCookiesOn? req.session.lastQueryResults=players_info: null;
    res.send(players_info);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
