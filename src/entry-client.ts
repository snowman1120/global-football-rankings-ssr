import { createApplication } from './main'

const { app, router } = createApplication();

(async (r, a) => {
  await r.isReady();
  a.mount('#app');
})(router, app);
