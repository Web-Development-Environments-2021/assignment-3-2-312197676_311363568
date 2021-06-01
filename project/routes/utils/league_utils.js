const axios = require("axios");
const DButils = require("./DButils");
const api_domain = process.env.api_domain;
const LEAGUE_ID = process.env.league_id;

async function getClosetMatch() {
  try{
    const closet_match= await DButils.execQuery(
      'SELECT TOP 1 match_id, date, hour, host_team, away_team, referee_id, stage_id, stadium, season_id from dbo.Matches where CONVERT(DATETIME,date,103) >= GETDATE() ORDER BY CONVERT(DATETIME,date,103)'
    );
    return closet_match;
    }
    catch(error){
      throw error;
    }

}

async function getLeagueDetails() {
  const league = await axios.get(
    `${api_domain}/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  const stage = await axios.get(
    `${api_domain}/stages/${league.data.data.current_stage_id}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  const next_game= await getClosetMatch();
  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    current_stage_name: stage.data.data.name,
    next_game_details: next_game.length==1 ? next_game[0] : null
    // next game details should come from DB
  };
}

async function getAllLeagues(){
  const all_league= await axios.get(`${api_domain}/leagues`,{
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  return all_league.data.data.map((data)=>{
    return {
      name: data.name,
      id: data.id
    };
  });
}

async function getLeagueCurrentSeassonId(){
  const league = await axios.get(
    `${api_domain}/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  const {current_season_id, current_stage_id, current_round_id} = league.data.data
  return {
    current_season_id: current_season_id,
    current_stage_id: current_stage_id,
    current_round_id: current_round_id
  }
}

async function getLeagueById(id){
  const league_by_id=await axios.get(`${api_domain}/leagues/${id}`,
  {
    params: {
      api_token: process.env.api_token,
      include: "country,seasons"
    }
  });
  return {
    league_id: league_by_id.data.data.id,
    league_name: league_by_id.data.data.name, 
    country:league_by_id.data.data.country.data.name,
    season: [
      league_by_id.data.data.seasons.data.map(function callbackFn (season){
        return{
        season_id: season.id,
        season_year: season.name
      }
    })
    ],
  }
}

async function getSeasonBySeassonID(seasonID){
  const seasonInfo=await axios.get(`${api_domain}/seasons/${seasonID}`,
  {
    params:{
      api_token: process.env.api_token,
      include: "stages"
    }
  });
  season=seasonInfo.data.data;
  return {
    season_id: season.id,
    season_year: season.name,
    cur_stage: season.current_stage_id,
    stages: getRelevantInformationFromStages(season.stages.data)
  }
}

function getRelevantInformationFromStages(stages){
  return stages.map((stage) => {
    return {
      id: stage.id,
      name: stage.name,
      type: stage.type
    }
  })
}

exports.getLeagueDetails = getLeagueDetails;
exports.getLeagueCurrentSeassonId = getLeagueCurrentSeassonId;
exports.getAllLeagues = getAllLeagues;
exports.getLeagueById=getLeagueById;
exports.getSeasonBySeassonID=getSeasonBySeassonID;