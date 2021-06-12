var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const players_utils = require("./utils/players_utils");
const teams_utils = require("./utils/teams_utils");
const coaches_utils = require("./utils/coaches_utils");

var isCookiesOn=false;
router.use(async function (req,res,next){
  req.session ? isCookiesOn=true : isCookiesOn=false;
  next();
})

router.get("/teamFullDetails/:teamId", async (req, res, next) => {

  try {
    const team_players_details = await players_utils.getPlayersByTeam(
      req.params.teamId
    );
    const team_details = await teams_utils.getTeamInfoById(
      req.params.teamId
    )
    team_details.team_players = team_players_details
    //we should keep implementing team page.....
    res.send(team_details);
  } catch (error) {
    next(error);
  }
});

router.get("/teamFullDetails/search/:teamName", async (req, res, next) => {
  try {
    const team_details = await teams_utils.getTeamInfoByName(
      req.params.teamName
    )
    isCookiesOn? req.session.lastQuery= req.params.teamName : null;
    isCookiesOn? req.session.lastQueryResults= team_details : null;
    res.send(team_details);
  } catch (error) {
    next(error);
  }
});

router.get("/teamFullDetails/", async (req, res, next) => {
  try {
    const seasson_details = await league_utils.getLeagueCurrentSeassonId();
    const teams_details = await teams_utils.getAllTeamsInfoBySeassonId(
      seasson_details.current_season_id)
    //we should keep implementing team page.....
    res.send(teams_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
