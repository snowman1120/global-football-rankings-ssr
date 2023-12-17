import { SitemapLeaf } from "express-sitemap-xml";
import { Request } from 'express';

import { Ranking } from "./model/Ranking.js";
import { Team } from "./model/Team.js";
import { SuperTeam } from "./model/SuperTeam.js";
import { SharedState } from "./SharedState.js";
import { PORT } from "./config.js";

let sitemapURLs: any[] = [];

export const timeAgoDisplay = (date: Date) => {
  const now = new Date();
  const minuteAgo = new Date(now.getTime() - 60000);
  const hourAgo = new Date(now.getTime() - 3600000);
  const dayAgo = new Date(now.getTime() - 86400000);
  const weekAgo = new Date(now.getTime() - 604800000);

  if (minuteAgo < date) {
    const diff = Math.round((now.getTime() - date.getTime()) / 1000);
    return `${diff} sec ago`;
  } else if (hourAgo < date) {
    const diff = Math.round((now.getTime() - date.getTime()) / 60000);
    return `${diff} min ago`;
  } else if (dayAgo < date) {
    const diff = Math.round((now.getTime() - date.getTime()) / 3600000);
    return `${diff} hrs ago`;
  } else if (weekAgo < date) {
    const diff = Math.round((now.getTime() - date.getTime()) / 86400000);
    return `${diff} days ago`;
  }
  const diff = Math.round((now.getTime() - date.getTime()) / 604800000);
  return `${diff} weeks ago`;
}

export const combine = (ranking: Ranking, otherRanking: Ranking): Ranking => {
  const allTeams: Team[] = [...ranking.teams.map(t => t.team), ...otherRanking.teams.map(t => t.team)];
  return generateRanking(allTeams, "COMBINED");
}

export const generateRanking = (ar: Team[], leagueName: string) => {
  const getData = (teams: Team[]) => {
    const total: number = teams.reduce((sum, team) => sum += team.SPI, 0);
    const average = total / teams.length;
    
    const stdDev = Math.sqrt( teams.map(team => Math.pow(team.SPI - average, 2)).reduce((sum, avg) => sum += avg, 0) / teams.length );
    
    const totalOff = teams.reduce((sum, team) => sum += team.offense, 0);
    const offAvg = totalOff / teams.length;
    
    const totalDef = teams.reduce((sum, team) => sum += team.defense, 0);
    const defAvg = totalDef / teams.length;
    
    return {avg: average, stdDev, avgOffense: offAvg, avgDefense: defAvg}
  }

  const getTotalData = getData(ar);
  const average = getTotalData.avg
  const stdDev = getTotalData.stdDev

  const top10 = ar.slice(0, 10);

  const getTopTenData = getData(top10)
  const averageTopTen = getTopTenData.avg
  const stdDevTopTen = getTopTenData.stdDev

  let sorted = ar.sort((a: Team, b: Team) => b.SPI - a.SPI);

  const bestTeam = sorted[0];
  const worstTeam = sorted[sorted.length - 1];
      
  const SPIAverage = average.toFixed(2);
  const SPIStdDev = stdDev.toFixed(1);
  const topTenSPIAverage = averageTopTen.toFixed(2);
  const topTenSPIStdDev = stdDevTopTen.toFixed(1);

  const offensiveAverage = getTotalData.avgOffense.toFixed(1);
  const defensiveAverage = getTotalData.avgDefense.toFixed(1);

  const ranking: Ranking = new Ranking(
    leagueName,
    average,
    stdDev,
    SPIAverage,
    SPIStdDev,
    offensiveAverage,
    defensiveAverage,
    averageTopTen,
    stdDevTopTen,
    topTenSPIAverage,
    topTenSPIStdDev,
    new SuperTeam(bestTeam),
    new SuperTeam(worstTeam),
    sorted.map((team) => new SuperTeam(team)),
    sorted.slice().map((team) => new SuperTeam(team)).reverse(),
    distributionCalculation(sorted),
  );

  return ranking
}

export const getTeamsFromRankings = (rankings: Ranking[]): Team[] => {
  return rankings.flatMap(ranking => ranking.teams.map(team => team.team));
}

export const generateURLs = (): SitemapLeaf[] => {
  const rankings: Ranking[] = SharedState.clubState.getState();
  const internationalRankings: Ranking[] = SharedState.internationalState.getState();
  if (rankings.length === 0 || internationalRankings.length === 0) return [];
  if (sitemapURLs.length > 0) {
    return sitemapURLs;
  }

  const prefix = "https://www.globalfootballrankings.com";
  const paths: string[] = [];
  {
    const clubLeagues = rankings.map(ranking => ranking.league.replace(/ /g, ""));
    for(const league in clubLeagues) {
      paths.push(`/info2/${league}`);
    }

    for (const ranking of rankings) {
      for(const team of ranking.teams) {
        paths.push(team.teamLink);
      }
    }

    const combinationsOfLeagues = clubLeagues.map((league, i) => 
      clubLeagues.slice(i + 1).map(oppLeague => [league, oppLeague])
    ).flat();
    for (let leagueCombo of combinationsOfLeagues) {
      paths.push(`/compare?first=${leagueCombo[0]}&second=${leagueCombo[1]}`);
    }
  }

  {
    const confederations = internationalRankings.map(rank => rank.league.replace(/ /g, ""));

    // Generating paths for each league in confederations
    for (const league of confederations) {
      paths.push(`/international/info2/${league}`);
    }

    // Generating paths for each team's teamLink in internationalRankings
    for (const ranking of internationalRankings) {
      for (const team of ranking.teams) {
        paths.push(team.teamLink);
      }
    }

    // Generating combinations of leagues for comparison
    const combinationsOfLeagues = confederations.map((league, i) => 
    confederations.slice(i + 1).map(oppLeague => [league, oppLeague])
    ).flat();
    for (let leagueCombo of combinationsOfLeagues) {
      paths.push(`/international/compare?first=${leagueCombo[0]}&second=${leagueCombo[1]}`);
    }
  }
  paths.push('/all', '/international', '/');
  const urls: SitemapLeaf[] = paths.map(path => prefix + path)
    .map(url => escapeHTML(url))
    .map(url => ({
      url: url,
      lastMod: SharedState.clubState.getStateAndLastUpdatedDateString()[0],
      changeFreq: 'daily',
      priority: url === 'https://www.globalfootballrankings.com/' ? 1.0 : 0.99,
    }));
  sitemapURLs = urls;
  return urls;
}

export const isSitemap = (req: Request) => {
  return req.url === '/sitemap.xml';
}

export const metaToString = (metaData: any) => {
  let result = '';
  if (metaData.title) {
    result += `<title>${metaData.title}</title>`;
    result += '\n';
  }
  if (metaData.meta && metaData.meta.length > 0) {
    for (const meta of metaData.meta) {
      result += '<meta';
      for (const key of Object.keys(meta)) result += ` ${key}="${meta[key]}"`;
      result += '>';
      result += '\n';
    }
  }
  return result;
}

export const getFullURL = (req: Request) => {
  return `${req.hostname}:${PORT}/${req.originalUrl}`
}

const escapeHTML = (str: string) => {
  return str.replace(/[&<>"']/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[tag] || tag));
}

function distributionCalculation(teams: Team[]): number[] {
  const iteration = 5;
  const distributions: number[] = new Array(100 / iteration).fill(0);

  for (const team of teams) {
    let i = 0;
    let current = 0;

    while (i !== 100 / iteration) {
      if (team.SPI >= current && team.SPI < current + iteration) {
        distributions[i] += 1;
        break;
      }

      i += 1;
      current += iteration;
    }
  }

  return distributions;
}