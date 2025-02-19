import type { PermissionState } from '/#/store';

import { store } from '/@/store';
import { defineStore } from 'pinia';
import { useLayoutStore } from './layout';

/**
 * 递归权限树，收集权限字符串和构建菜单树
 */
// function collectPermissions(perTree: PerTree): {
//   routePermissions: string[];
//   actionPermissions: string[];
//   menuTree: MenuTree;
// } {
//   const routePermissions: string[] = [];
//   const actionPermissions: string[] = [];
//   const collect = (perTree: PerTree): MenuTree => {
//     const menuTree: MenuTree = [];
//     perTree.forEach((childNode: PerTreeNode) => {
//       const { menuType, component, visible, children = [] } = childNode;
//       if (menuType === 'M') {
//         if (visible === 0) {
//           const { flatDirKeys } = layoutSetting;
//           if (flatDirKeys.indexOf(component) === -1) {
//             menuTree.push(generateMenuItem(childNode, collect(children)));
//           } else {
//             menuTree.push(...collect(children));
//           }
//         }
//       } else if (menuType === 'C') {
//         routePermissions.push(component);
//         if (visible === 0) {
//           const cloneNode = { ...childNode };
//           if (cloneNode.children) {
//             delete cloneNode.children;
//           }
//           menuTree.push(generateMenuItem(cloneNode));
//         }
//       }
//     });
//     return menuTree;
//   };
//   const menuTree = collect(perTree);
//   return {
//     routePermissions,
//     actionPermissions,
//     menuTree
//   };
// }

/**
 * 构建菜单项
 */
// function generateMenuItem(perNode: PerTreeNode, children?: MenuTree): MenuItem {
//   const menuItem: MenuItem = { title: perNode.menuName, key: perNode.component };
//   if (perNode.menuType === 'C') {
//     let path: any = perNode.path;
//     path = path.split(':');
//     menuItem.pkg = path[0];
//     menuItem.url = path[1];
//   }
//   if (perNode.icon) {
//     const arr = perNode.icon.split(':');
//     menuItem.icon = {
//       type: arr[2] as any,
//       form: arr[1],
//       name: arr[0]
//     };
//   }
//   if (children) {
//     menuItem.children = children;
//   }
//   return menuItem;
// }

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
      // const { routePermissions, actionPermissions, menuTree } = collectPermissions();
      this.routePermissions = [];
      this.actionPermissions = [];
      // const layoutStore = useLayoutStore();
      // layoutStore.menuTree = menuTree;
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
