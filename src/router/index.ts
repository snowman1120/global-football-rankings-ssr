import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';
import { isSSR } from '../helpers'

import Team from '@/pages/team/team.vue';
import WorldCupGroups from '@/pages/worldcupgroups/worldcupgroups.vue';
import Ranking from '@/pages/ranking/Ranking.vue';
import Info from '@/pages/info/Info.vue';

const createApplicationRouter = () => {
  const router = createRouter({
    history: isSSR() ? createMemoryHistory() : createWebHistory(),
    routes: [
      { path: '/', component: Ranking },
      { path: '/international', component: Ranking },
      { path: '/team/:id', component: Team },
      { path: '/worldcupgroups', component: WorldCupGroups },
      { path: '/compare', component: Info },
      { path: '/international/compare', component: Info },
      { path: '/compare/:first/:second', component: Info },
      { path: '/international/compare/:first/:second', component: Info },
      { path: '/all', component: Info },
      { path: '/international/all', component: Info },
      { path: '/info2/:league', component: Info },
      { path: '/international/info2/:league', component: Info },
    ],
  });

  // router.onError((error, to) => {
  //   // on new deploy, hashed module/component names may no longer match current deployment. When that happens, do a hard refresh
  //   if (error.message.includes('Failed to fetch dynamically imported module')) {
  //     if (window !== undefined) window.location.href = to.fullPath;
  //   }
  // });
  return router;
}

export default createApplicationRouter;
