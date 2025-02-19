import type { RouteLocationNormalized } from 'vue-router';

import { usePageUpdateStore } from '/@/store/modules/pageUpdate';

/**
 * 列表页
 * @param route 列表页路由对象
 */
export const useList = (route: RouteLocationNormalized) => {
  const routeName = String(route.name);
  const pageUpdateStore = usePageUpdateStore();
  const needReset = computed(() => {
    return pageUpdateStore.needUpdate(routeName);
  });
  const resetListFinished = () => {
    pageUpdateStore.finishUpdate(routeName);
  };
  /**
   * 不管是否需要重置，直接调用
   * @param callFun 需要重置时调用的异步函数
   * @param defaultFun 不需要重置时调用的函数
   */
  const resetList = (callFun: Function, defaultFun?: Function) => {
    if (needReset.value) {
      callFun().then(() => {
        pageUpdateStore.finishUpdate(routeName);
      });
    } else {
      defaultFun?.();
    }
  };
  return {
    needReset,
    resetListFinished,
    resetList
  };
};
