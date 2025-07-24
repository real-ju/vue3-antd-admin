export function getEnv() {
  // __VITE_ENV__ 在vite.config -> define中定义
  return (__VITE_ENV__ as unknown as ViteEnv) || {};
}
