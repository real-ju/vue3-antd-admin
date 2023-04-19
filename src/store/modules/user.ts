import { defineStore } from 'pinia';
import type { UserState } from '/#/store';

export const useUserStore = defineStore({
  id: 'user',
  state: (): UserState => ({
    isLogin: false,
    userInfo: null,
    token: null
  }),
  getters: {
    getUserInfo(state) {
      return state.userInfo || {};
    },
    getToken(state) {
      return state.token || '';
    }
  },
  actions: {
    login(userInfo: Recordable, token: string) {
      this.userInfo = userInfo;
      this.token = token;
      this.isLogin = true;
    },
    logout() {
      this.userInfo = null;
      this.token = null;
      this.isLogin = false;
    }
  },
  persist: { key: 'pinia-persistedstate-user' }
});
