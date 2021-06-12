const axios = require("axios");
const api_domain = process.env.api_domain;

async function getTeamsInfoById(teams_ids_list){
    let promises = [];
    teams_ids_list.map((id) =>
      promises.push(
        axios.get(`${api_domain}/teams/${id}`, {
          params: {
            api_token: process.env.api_token,
            include: "venue"
          },
        })
      )
    );
    let teams_info = await Promise.all(promises);
    return extractRelevantTeamsData(teams_info);
  }

async function getTeamInfoById(team_id){
  const team_info = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      api_token: process.env.api_token,
      include: "venue"
    },
  })
  return extractRelevantTeamData(team_info.data.data)
}

async function getTeamInfoByName(team_name){
  const team_info = await axios.get(`${api_domain}/teams/search/${team_name}`, {
    params: {
      api_token: process.env.api_token,
      include: "venue"
    },
  })
  return extractRelevantTeamsData(team_info)
}

async function getAllTeamsInfoBySeassonId(seasson_id){
  const all_teams = await axios.get(`${api_domain}/teams/season/${seasson_id}`, {
    params: {
      api_token: process.env.api_token,
      include: "venue"
    },
  })
return extractRelevantTeamsData(all_teams);

}


function extractRelevantTeamData(team_info) {
    const stadium  = team_info.venue.data.name;
    const {name, id, logo_path, short_code}=team_info;
    return {
      id: id,
      name: name,
      logo: logo_path,
      short_code: short_code,
      stadium: stadium
    };
}


function extractRelevantTeamsData(teams_info) {
  try{
    return teams_info.map((team_info) => {
      //const { fullname, image_path, position_id } = player_info.data.data;
      return extractRelevantTeamData(team_info.data.data)
    });
  } catch(err){
      try{
      return teams_info.data.data.map((team_info) => {
        //const { fullname, image_path, position_id } = player_info.data.data;
        return extractRelevantTeamData(team_info)
      });
   } catch(err){
       throw err
  }
  } 

}


  exports.getTeamsInfoById=getTeamsInfoById;
  exports.getTeamInfoById=getTeamInfoById;
  exports.getTeamInfoByName=getTeamInfoByName;
  exports.getAllTeamsInfoBySeassonId=getAllTeamsInfoBySeassonId;