import type { UserState } from '/#/store';
import type { StoreDefinition } from 'pinia';

import { defineStore } from 'pinia';
import { usePermissionStore } from './permission';
import { storage } from '/@/utils/storage';
import { toRaw } from 'vue';
// import { logout } from '/@/api/auth';
// import { router } from '/@/router';
import { store as pinia } from '../index';

// 记住登录，此变量与localStorage保持一致
let rememberLogin = storage.get('app-remember-login') || false;

const createStoreDef = () => {
  let defaultState: any;
  const storage = rememberLogin ? localStorage : sessionStorage;
  if (_useUserStore) {
    // 拷贝上一个store的state
    const userStore = _useUserStore();
    const userStoreRaw = toRaw(userStore);
    defaultState = commonStoreOptions.state();
    Object.keys(defaultState).forEach((key) => {
      defaultState[key] = toRaw(unref(userStoreRaw[key]));
    });

    // 释放上一个store https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html#-dispose-
    userStore.$dispose();
    Reflect.deleteProperty(pinia.state.value, userStore.$id);

    // 清除历史数据，避免初始化时覆盖默认state（页面第一次加载时无需清除）
    storage.removeItem('pinia-persistedstate-user');
  } else {
    defaultState = commonStoreOptions.state();
  }
  const _commonStoreOptions = { ...commonStoreOptions };
  Reflect.deleteProperty(_commonStoreOptions, 'state');

  const useStore = defineStore({
    id: `user_${rememberLogin ? 'localStorage' : 'sessionStorage'}`,
    state: (): UserState => defaultState,
    ..._commonStoreOptions,
    persist: {
      key: 'pinia-persistedstate-user',
      storage
    }
  });
  setTimeout(() => {
    const store = useStore();
    store.$persist();
  }, 0);
  _useUserStore = useStore;
};

// 在(退出)登录成功后调用
export const setRememberLogin = (remember: boolean) => {
  storage.set('app-remember-login', remember);
  if (remember !== rememberLogin) {
    rememberLogin = remember;
    createStoreDef();
  }
};

export function useUserStore() {
  return _useUserStore();
}

const commonStoreOptions: Recordable = {
  state: (): UserState => ({
    isLogin: false,
    token: null,
    userInfo: null
  }),
  getters: {
    getToken(state: UserState) {
      return state.token || '';
    },
    getUserInfo(state: UserState) {
      return state.userInfo || {};
    }
  },
  actions: {
    login(userInfo: Recordable, token: string) {
      this.userInfo = userInfo;
      this.token = token;
      this.isLogin = true;
    },
    setToken(token: string) {
      this.token = token;
    },
    async logout(nullifyToken = true, forward = false) {
      // if (nullifyToken) {
      //   await logout();
      // }

      // 清理权限信息
      const permissionStore = usePermissionStore();
      permissionStore.clearPermissions();

      // 清理用户信息
      this.userInfo = null;
      this.token = null;
      this.isLogin = false;

      // 重置记住登录
      setRememberLogin(false);

      // if (forward) {
      //   router.push(BasicPageEnum.LOGIN);
      // }
    }
  }
};

let _useUserStore: StoreDefinition<'user_localStorage' | 'user_sessionStorage', UserState>;
createStoreDef();
