import { Request } from 'express';
import { createHome, compare, info2, all, team, worldcupgroups } from './api/utils.js';
import { SharedState } from './SharedState.js';
import { getFullURL } from './utils.js';

const getRankingMeta = (req: Request, isInternational: boolean) => {
  const res = createHome(isInternational);
  const meta: any = {};
  meta.title = res.topTitle;
  meta.meta = [];

  if (!res.isInternational) {
    meta.meta = [{
      name: 'ahrefs-site-verification',
      content: 'c0a112a3627e41ad7d0b61d494564e04ffcc6858c89c3abf87a66d7ff3dd3add',
    }];
  }
  meta.meta.push({
    name: 'description',
    content: 'Football / Soccer League Rankings is a list of professional football leagues in the world and their strength Pretty simple! It takes the rankings of all clubs from FiveThirtyEight, groups them into what league they belong too, and calculates the average SPI (Soccer Power Index) and the standard deviation of the values!',
  }, {
    name: 'keywords',
    content: `Soccer,club,football,SPI,soccer power index,ranking,association football,futbol,best leagues,best national teams,${res.topTitle}`,
  }, {
    name: 'author',
    content: 'Joe Mecca',
  }, {
    name: 'viewport',
    content: 'width=device-width, initial-scale=0.9',
  }, {
    property: 'og:title',
    content: res.topTitle,
  }, {
    property: 'og:description',
    content: 'Football / Soccer League Rankings is a list of professional football leagues in the world and their strength Pretty simple! It takes the rankings of all clubs from FiveThirtyEight, groups them into what league they belong too, and calculates the average SPI (Soccer Power Index) and the standard deviation of the values!',
  }, {
    property: 'og:image',
    content: 'https://www.globalfootballrankings.com/share.jpg',
  }, {
    property: 'og:type',
    content: 'website',
  }, {
    property: 'twitter:card',
    content: 'summary_large_image',
  }, {
    property: 'twitter:title',
    content: res.topTitle,
  }, {
    property: 'twitter:description',
    content: 'Football / Soccer League Rankings is a list of professional football leagues in the world and their strength Pretty simple! It takes the rankings of all clubs from FiveThirtyEight, groups them into what league they belong too, and calculates the average SPI (Soccer Power Index) and the standard deviation of the values!',
  }, {
    property: 'twitter:image',
    content: 'https://www.globalfootballrankings.com/share.jpg',
  }, {
    property: 'twitter:creator',
    content: '@LeaguesRank',
  });

  return meta;
}

const getInfoMeta = (req: Request, isInternational: boolean) => {
  const fullURL: string = getFullURL(req);
  const url = new URL(fullURL);
  let res: any;
  if (req.originalUrl.includes('/compare')) {
    let first: any;
    let second: any;
    if (url.searchParams.get('first')) {
      first = url.searchParams.get('first');
      second = url.searchParams.get('second');
    } else {
      const splitURL = fullURL.split('/');
      first = splitURL[splitURL.length - 2];
      second = splitURL[splitURL.length - 1];
    }
    res = compare(isInternational ? SharedState.internationalState : SharedState.clubState, first, second, isInternational);
  } else if (req.originalUrl.includes('/all')) {
    res = all(isInternational);
  } else if (req.originalUrl.includes('/info2')) {
    const league = req.originalUrl.split('/info2/')[1];
    res = info2(league, isInternational);
  }

  const meta: any = {};
  meta.title = res.state.title || res.state.topTitle;
  meta.meta = [];

  if (res.state.firstLeague === res.state.otherLeague) {
    if (res.isInternational) {
      meta.meta.push({
        name: 'description',
        content: `Global football / soccer international team world rankings based on the SPI rating system. Stay up to date with the latest world rankings for ${res.state.title}`,
      });
    } else {
      meta.meta.push({
        name: 'description',
        content: `Global football / soccer league world rankings based on the SPI rating system. Stay up to date with the latest power rankings for the ${res.state.title}`,
      });
    }
  } else {
    meta.meta.push({
      name: 'description',
      content: `Compare the latest football / soccer world rankings for hundreds of men's teams across dozens of leagues. See how the rankings compare for ${res.state.title} now`,
    });
  }

  meta.meta.push({
    name: 'keywords',
    content: `Soccer,club,football,SPI,soccer power index,ranking,association football,futbol,best leagues,best national teams,${res.state.topTitle},${res.state.title},${res.state.ranking.bestTeam.team.name}`,
  }, {
    name: 'author',
    content: 'Joe Mecca',
  }, {
    name: 'viewport',
    content: 'width=device-width, initial-scale=0.9',
  });

  if (res.state.firstLeague === res.state.otherLeague) {
    if (res.state.isInternational) {
      meta.meta.push({
        property: 'og:description',
        content: `Global football / soccer international team world rankings based on the SPI rating system. Stay up to date with the latest world rankings for ${res.state.title}`,
      });
    } else {
      meta.meta.push({
        property: 'og:description',
        content: `Global football / soccer league world rankings based on the SPI rating system. Stay up to date with the latest power rankings for the ${res.state.title}`,
      });
    }
  } else {
    meta.meta.push({
      name: 'og:description',
      content: `Compare the latest football / soccer world rankings for hundreds of men's teams across dozens of leagues. See how the rankings compare for ${res.state.title} now`
    });
  }

  meta.meta.push({
    property: 'og:title',
    content: res.state.title,
  }, {
    property: 'og:image',
    content: 'https://www.globalfootballrankings.com/share.jpg',
  }, {
    property: 'og:type',
    content: 'website',
  });

  meta.meta.push({
    property: 'twitter:card',
    content: 'summary_large_image',
  }, {
    property: 'twitter:title',
    content: res.state.title,
  });

  if (res.state.firstLeague === res.state.otherLeague) {
    if (res.state.isInternational) {
      meta.meta.push({
        property: 'twitter:description',
        content: `Global football / soccer international team world rankings based on the SPI rating system. Stay up to date with the latest world rankings for ${res.state.title}`,
      });
    } else {
      meta.meta.push({
        property: 'twitter:description',
        content: `Global football / soccer league world rankings based on the SPI rating system. Stay up to date with the latest power rankings for the ${res.state.title}`,
      });
    }
  } else {
    meta.meta.push({
      property: 'twitter:description',
      content: `Compare the latest football / soccer world rankings for hundreds of men's teams across dozens of leagues. See how the rankings compare for ${res.state.title} now`,
    });
  }

  meta.meta.push({
    property: 'twitter:image',
    content: 'https://www.globalfootballrankings.com/share.jpg',
  }, {
    property: 'twitter:creator',
    content: '@LeaguesRank',
  });

  return meta;
}

const getTeamMeta = (req: Request, isInternational: boolean) => {
  const teamId = req.originalUrl.split('/team/')[1];
  const res = team(teamId);

  const meta: any = {};
  meta.meta = [];
  meta.title = `${res.topTitle} | Football Club Team Rankings`;

  meta.meta.push({
    name: 'description',
    content: `Global football / soccer club team world rankings based on the SPI rating system. Stay up to date with the latest power rankings for ${res.topTitle}`,
  }, {
    name: 'keywords',
    content: `Soccer,club,football,SPI,soccer power index,ranking,association football,futbol,best leagues,best national teams, ${res.topTitle}, ${res.team.team.league}`,
  }, {
    name: 'author',
    content: 'Joe Mecca',
  }, {
    name: 'viewport',
    content: 'width=device-width, initial-scale=0.9',
  }, {
    property: 'og:title',
    content: res.topTitle,
  }, {
    property: 'og:description',
    content: `Global football / soccer club team world rankings based on the SPI rating system. Stay up to date with the latest power rankings for ${res.topTitle}`,
  }, {
    property: 'og:image',
    content: 'https://www.globalfootballrankings.com/share.jpg',
  }, {
    property: 'og:type',
    content: 'website',
  }, {
    property: 'twitter:card',
    content: 'summary_large_image',
  }, {
    property: 'twitter:title',
    content: res.topTitle,
  }, {
    property: 'twitter:description',
    content: `Global football / soccer club team world rankings based on the SPI rating system. Stay up to date with the latest power rankings for ${res.topTitle}`,
  }, {
    property: 'twitter:image',
    content: 'https://www.globalfootballrankings.com/share.jpg',
  }, {
    property: 'twitter:creator',
    content: '@LeaguesRank',
  });

  return meta;
}

const getWorldcupgroupsMeta = (req: Request, isInternational: boolean) => {
  const res: any = worldcupgroups();
  const meta: any = {};
  meta.meta = [];

  meta.title = res.topTitle;
  if (!res.isInternational) {
    meta.meta = [{
      name: 'ahrefs-site-verification',
      content: 'c0a112a3627e41ad7d0b61d494564e04ffcc6858c89c3abf87a66d7ff3dd3add',
    }];
  }
  meta.meta.push({
    name: 'description',
    content: 'Football / Soccer League Rankings is a list of professional football leagues in the world and their strength Pretty simple! It takes the rankings of all clubs from FiveThirtyEight, groups them into what league they belong too, and calculates the average SPI (Soccer Power Index) and the standard deviation of the values!',
  }, {
    name: 'keywords',
    content: 'Soccer,club,football,SPI,soccer power index,ranking,association football,futbol,best leagues,best national teams',
  }, {
    name: 'author',
    content: 'Joe Mecca',
  }, {
    name: 'viewport',
    content: 'width=device-width, initial-scale=0.9',
  });

  return meta;
}

export const getMetaData = (req: Request) => {
  const isInternational: boolean = req.originalUrl.includes('/international');
  const url = req.originalUrl;
  if (url.includes('/team')) return getTeamMeta(req, isInternational);
  else if (url.includes('/worldcupgroups')) return getWorldcupgroupsMeta(req, isInternational);
  else if (url.includes('/compare') || url.includes('/all') || url.includes('/info2')) return getInfoMeta(req, isInternational);
  return getRankingMeta(req, isInternational);
}