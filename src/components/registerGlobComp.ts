import type { App } from 'vue';

import Antd from 'ant-design-vue/es';

import { Icon } from './index';

export function registerGlobComp(app: App) {
  // antd components register
  app.use(Antd);

  // common components register
  app.component('Icon', Icon);
}
