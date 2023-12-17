/**
 * 
 */
import * as https from 'https';
import * as csv from 'fast-csv';
import { URL } from 'url';

import { Team } from './model/Team.js';
import { Ranking } from './model/Ranking.js';
import { WorldCupGroupMappings } from './model/WorldCupGroupMappings.js';
import { WorldCupData } from './model/WorldCupData.js';
import { AllDataTeamType } from './model/AllDataTeamType.js';
import { SharedState } from './SharedState.js';
import { generateRanking } from './utils.js';

const getTeamInfoFromCSV = async (url: string | https.RequestOptions | URL, leagueKey: String): Promise<any[]> => {
  const map = (teams: any[], leagueKey: any) => teams.map(team => (new Team(
      Number(team.spi),
      Number(team.off),
      Number(team.def),
      team.name,
      team[leagueKey],
  )));
  return new Promise((resolve, reject) => {
    const data: any[] = []
    https.get(url, response => {
      response
        .pipe(csv.parse({ headers: true }))
        .on('error', (error: any) => console.error(error))
        .on('data', (row: any) => data.push(row))
        .on('end', () => resolve(map(data, leagueKey)));
    }).on('error', error => reject(error));
  });
}

function generate(teams: Team[]): Ranking[] {
  const dict: { [key: string]: Team[] } = {};
  for (const team of teams) {
      if (dict[team.league]) {
          dict[team.league].push(team);
      } else {
          dict[team.league] = [team];
      }
  }
  const leagueSPIAverages: Ranking[] = [];
  for (const k in dict) {
      const ar = dict[k];
      const ranking = generateRanking(ar, k);
      leagueSPIAverages.push(ranking);
  }
  return leagueSPIAverages.sort((a, b) => b.average - a.average);
}

const downloadClubTeams = async () => {
  const teams: Team[] = await getTeamInfoFromCSV('https://projects.fivethirtyeight.com/soccer-api/club/spi_global_rankings.csv', 'league');
  const ranking = generate(teams)
    .filter(team => !team.league.includes('UEFA'));
  const allDataType: AllDataTeamType = {
    time: Date.now() / 1000, // Convert milliseconds to seconds
    teams: teams,
  };
  return { AllDataTeamType: allDataType, ranking };
}

const downloadNationalTeams = async () => {
  const teams: Team[] = await getTeamInfoFromCSV('https://projects.fivethirtyeight.com/soccer-api/international/spi_global_rankings_intl.csv', 'confed');
  const ranking = generate(teams);
  const allDataType: AllDataTeamType = {
    time: Date.now() / 1000, // Convert milliseconds to seconds
    teams: teams,
  };
    
  let worldCupData = new WorldCupGroupMappings().filter(allDataType.teams)
      
  return { AllDataTeamType: allDataType, ranking, worldCupData };
}

export const download = async () => {
  const { AllDataTeamType: allDataType, ranking } = await downloadClubTeams();
  const { AllDataTeamType: allDataTypeInternational, ranking: rankingInternational, worldCupData: worldCupGroups } = await downloadNationalTeams();
  SharedState.internationalState.submitNewData(rankingInternational, allDataTypeInternational)
  SharedState.clubState.submitNewData(ranking, allDataType)
  WorldCupData.data.setWorldGroups(worldCupGroups)
}