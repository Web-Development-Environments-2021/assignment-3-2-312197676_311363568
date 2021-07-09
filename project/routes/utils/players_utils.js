const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

async function getPlayerIdsByTeam(team_id) {
  let player_ids_list = [];
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  });
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}

async function getPlayerInfoByName(player_name){
  const players_info = await axios.get(`${api_domain}/players/search/${player_name}`, {
    params: {
      api_token: process.env.api_token,
      include: "team",
    },
  })
  if (players_info.data.data.length == 0){
    return players_info.data.data
  }
  return extractRelevantPlayersData(players_info)
}

async function getPlayerInfoById(player_id){
  const player_info = await axios.get(`${api_domain}/players/${player_id}`, {
    params: {
      api_token: process.env.api_token,
      include: "team",
    },
  })
  return extractRelevantPlayerData(player_info.data.data)
}

async function getPlayersInfo(players_ids_list) {
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      getPlayerInfoById(id)
    )
  );
  let players_info = await Promise.all(promises);
  return players_info;
}

async function getPlayersByTeam(team_id) {
  const player_ids_list = await getPlayerIdsByTeam(team_id);
  const players_info = await getPlayersInfo(player_ids_list);
  return players_info;
}

function extractRelevantPlayersData(players_info) {
  try{
    return players_info.map((player_info) => {
      return extractRelevantPlayerData(player_info.data.data)
    });
  } catch(err){
      try{
      return players_info.data.data.map((player_info) => {
        return extractRelevantPlayerData(player_info)
      });
   } catch(err){
       throw err
  }
  } 
}

function extractRelevantPlayerData(player_info){
  const {player_id, fullname, image_path, position_id,
    common_name, nationality, birthdate, birthcountry, height, weight} = player_info;
  let team_name = null
  if(player_info.team && player_info.team.data){
    team_name = player_info.team.data.name;
    }
  return {
    id: player_id,
    name: fullname,
    common_name: common_name,
    position: position_id,
    team_name: team_name,
    nationality: nationality,
    birthdate: birthdate,
    birthcountry: birthcountry,
    height: height,
    weight: weight,
    image: image_path,
  };
}

exports.getPlayerInfoByName = getPlayerInfoByName;
exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getPlayerInfoById = getPlayerInfoById;
