import type { PluginOption } from 'vite';

import vitePluginConditionalCompile from 'vite-plugin-conditional-compile';

export interface ConditionalCompilePluginConfig {
  env?: Recordable;
  include?: string | RegExp | (string | RegExp)[] | null;
}
// 示例
// {
//   env: {
//     XXX: 'xxx'
//   },
//   include: ['src/router/routes/index.ts']
// }

export function configConditionalCompilePlugin(config?: ConditionalCompilePluginConfig) {
  const conditionalCompilePlugin: PluginOption = vitePluginConditionalCompile(config);

  return conditionalCompilePlugin;
}
