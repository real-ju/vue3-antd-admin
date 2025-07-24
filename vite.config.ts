import type { UserConfig, ConfigEnv } from 'vite';
import { loadEnv } from 'vite';
import { createVitePlugins } from './build/vite/plugin';
import { wrapEnv, pathResolve } from './build/utils';

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  env.MODE = mode;

  const viteEnv = wrapEnv(env);

  return {
    base: viteEnv.VITE_PUBLIC_PATH,
    resolve: {
      alias: [
        // /@/xxxx => /src/xxxx
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/'
        },
        // /#/xxxx => /types/xxxx
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/'
        }
      ]
    },
    plugins: createVitePlugins(viteEnv),
    server: {
      host: true,
      proxy: {
        '/api': {
          target: viteEnv.VITE_DEV_SERVER_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    define: {
      __VITE_ENV__: viteEnv
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: (content: string, filePath: string) => {
            let rst: string = "@import '/@/design/util.less';";
            rst += content;
            return rst;
          }
        }
      }
    },
    build: {
      outDir: 'dist' + viteEnv.VITE_PUBLIC_PATH,
      sourcemap: mode === 'development'
    }
  };
};
