import { createSSRApp, createApp, h } from 'vue'
import { Router } from 'vue-router';
import App from './App.vue'
import { isSSR } from './helpers';
import createApplicationRouter from './router';
import { META_MANAGER } from './config';

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApplication() {
  const app = isSSR() ? createSSRApp(App) : createApp(App);

  const router: Router = createApplicationRouter();
  
  app.use(router);

  app.use(META_MANAGER);
  
  return { app, router }
}
