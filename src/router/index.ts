import type { App } from 'vue';

import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { setupRouterGuard } from './guard';
import { getEnv } from '/@/utils/env';
import projectSetting from '/@/settings/projectSetting';
import { RouteHistoryModeEnum } from '/@/enums/appEnum';

const { routeHistoryMode } = projectSetting;
const publicPath = getEnv().VITE_PUBLIC_PATH;

// router instance
export const router = createRouter({
  history:
    routeHistoryMode === RouteHistoryModeEnum.HTML5
      ? createWebHistory(publicPath)
      : createWebHashHistory(publicPath),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      };
    } else {
      return {
        top: 0,
        left: 0
      };
    }
  }
});

// config router
export function setupRouter(app: App) {
  setupRouterGuard(router);
  app.use(router);
}
