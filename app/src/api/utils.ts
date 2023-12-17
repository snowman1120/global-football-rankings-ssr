import * as express from 'express';
import { SharedState } from '../SharedState.js';
import { WorldCupData } from '../model/WorldCupData.js';
import { timeAgoDisplay, combine, generateRanking, getTeamsFromRankings } from '../utils.js';
const router = express.Router();

const subRouter = express.Router({ mergeParams: true });
router.use('/international', subRouter);

const getSomeInfo = (isInternational: boolean) => {
  if (isInternational) {
    return {
      relativePathString: '/international',
      topTitle: 'Football International Club League Rankings',
      whatIsThis: `Football International Club League Rankings is a list of FIFA confederations in the world and their strength`,
      howDoesThisWork: 'Pretty simple! It takes the rankings of all national teams from FiveThirtyEight, groups them into what confederation they belong too, and calculates the average SPI (Soccer Power Index) and the standard deviation of the values!',
    }
  }
  return {
    relativePathString: '',
    topTitle: 'Football League Rankings',
    whatIsThis: `Football League Rankings is a list of professional football leagues in the world and their strength`,
    howDoesThisWork: 'Pretty simple! It takes the rankings of all clubs from FiveThirtyEight, groups them into what league they belong too, and calculates the average SPI (Soccer Power Index) and the standard deviation of the values!',
  }
}

export const createHome = (isInternational: boolean) => {
  const data = (isInternational ? SharedState.internationalState : SharedState.clubState).getStateAndLastUpdatedDateString();
  const timeAgoString = timeAgoDisplay(data[0]);
  return {
    state: data[1],
    time: timeAgoString,
    isInternational,
    prependedRelativePath: getSomeInfo(isInternational).relativePathString,
    topTitle: getSomeInfo(isInternational).topTitle,
    whatIsThis: getSomeInfo(isInternational).whatIsThis,
    howDoesThisWork: getSomeInfo(isInternational).howDoesThisWork
  }
};

export const compare = (sharedState: SharedState, firstId: any, secondId: any, isInternational: boolean) => {
  const rankingFirst = sharedState.info(firstId);
  const rankingSecond = sharedState.info(secondId);
  if (rankingFirst && rankingSecond) {
    const combinedRanking = combine(rankingFirst, rankingSecond);
    const title = `${rankingFirst.leagueModel.displayName()} vs ${rankingSecond.leagueModel.displayName()}`;
    return {
      state: {
        ranking: combinedRanking,
        title: title,
        amountOfLeagues: 2,
        firstLeague: rankingFirst.leagueModel.displayName(),
        otherLeague: rankingSecond.leagueModel.displayName(),
        info: "This is a combination  of all teams in \(ranking.league) and \(ranking1.league). This gives you an idea of how the teams would do against each other",
        isInternational: isInternational,
        prependedRelativePath: getSomeInfo(isInternational).relativePathString,
        howDoesThisWork: getSomeInfo(isInternational).howDoesThisWork,
        topTitle: getSomeInfo(isInternational).topTitle,
        lowercaseTitle: title.toLowerCase(),
        isCompare: true
      }
    }
  }
}

export const info2 = (id: string, isInternational: boolean) => {
  const ranking = (isInternational ? SharedState.internationalState : SharedState.clubState).info(id);
  const title = ranking?.leagueModel.displayName();
  const info = {
    ranking: ranking,
    title: ranking?.leagueModel.displayName(),
    amountOfLeagues: 1,
    firstLeague: ranking?.leagueModel.displayName(),
    otherLeague: ranking?.leagueModel.displayName(),
    info: `This is a list of the teams in the league, ${ranking?.league}, ranked by their SPI. This is not the current standings.`,
    isInternational: isInternational,
    prependedRelativePath: getSomeInfo(isInternational).relativePathString,
    howDoesThisWork: getSomeInfo(isInternational).howDoesThisWork,
    topTitle: getSomeInfo(isInternational).topTitle,
    lowercaseTitle: title.toLowerCase(),
    isCompare: false
  }
  return {
    state: info,
    id,
  }
}

export const all = (isInternational: boolean) => {
  const sharedState: SharedState = isInternational ? SharedState.internationalState : SharedState.clubState;
  const ranking = generateRanking(getTeamsFromRankings(sharedState.getState()), 'Clubs');
  const info = {
    ranking: ranking,
    title: ranking.league,
    amountOfLeagues: 3,
    firstLeague: ranking.league,
    otherLeague: ranking.league,
    info: "This is a list of the all the club teams that are currently ranked in the world, ranked by their SPI.",
    isInternational: isInternational,
    prependedRelativePath: getSomeInfo(isInternational).relativePathString,
    howDoesThisWork: getSomeInfo(isInternational).howDoesThisWork,
    topTitle: getSomeInfo(isInternational).topTitle,
    lowercaseTitle: ranking.league.toLowerCase(),
    isCompare: false
  };
  return {
    state: info,
  }
}

export const team = (id: string) => {
  const team = SharedState.clubState.team(id) || SharedState.internationalState.team(id);
  if (!id || !team) throw new Error('Not Found');
  return {
    topTitle: team.team.name,
    team,
  };
}

export const worldcupgroups = () => {
  return {
    topTitle: 'World Cup Groups',
    groups: WorldCupData.data.getWorldGroups(),
  };
};

export default router;