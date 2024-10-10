import type { Plugin } from 'vite';

import vueJsx from '@vitejs/plugin-vue-jsx';

export function configVueJsxPlugin() {
  const vueJsxPlugin: Plugin = vueJsx();

  return vueJsxPlugin;
}
