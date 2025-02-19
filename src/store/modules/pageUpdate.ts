import type { PageUpdateState } from '/#/store';

import { defineStore } from 'pinia';

export const usePageUpdateStore = defineStore({
  id: 'pageUpdate',
  state: (): PageUpdateState => ({
    needUpdatePageNames: new Set()
  }),
  getters: {},
  actions: {
    /**
     * 添加需要更新数据的页面
     * @param name 页面route name
     */
    addNeedUpdatePage(name: string) {
      this.needUpdatePageNames.add(name);
    },
    // 判断页面是否需要更新数据
    needUpdate(name: string) {
      return this.needUpdatePageNames.has(name);
    },
    // 数据更新后调用
    finishUpdate(name: string) {
      if (this.needUpdatePageNames.has(name)) {
        this.needUpdatePageNames.delete(name);
      }
    }
  }
});
