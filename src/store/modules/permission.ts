import type { PermissionState } from '/#/store';

import { store } from '/@/store';
import { defineStore } from 'pinia';

export const usePermissionStore = defineStore({
  id: 'permission',
  state: (): PermissionState => ({
    hasFetchedPermissionData: false,
    routePermissions: [],
    actionPermissions: []
  }),
  getters: {
    allPermissions(state): string[] {
      return [...state.routePermissions, ...state.actionPermissions];
    }
  },
  actions: {
    generatePermissions() {
      this.routePermissions = [];
      this.actionPermissions = [];
      return true;
    },
    clearPermissions() {
      this.routePermissions = [];
      this.actionPermissions = [];
      this.hasFetchedPermissionData = false;
    }
  }
});

// Need to be used outside the setup
export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
