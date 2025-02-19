import { Props as IconProps } from '/@/components/Icon';

import { MenuModeEnum } from '/@/enums/layoutEnum';

/* user module */
export interface UserState {
  isLogin: boolean;
  userInfo: Nullable<Recordable>;
  token: Nullable<string>;
}

// interface UserInfo {}

/* permission module */
export interface PermissionState {
  // 是否已从后端获取了权限数据
  hasFetchedPermissionData: boolean;
  routePermissions: string[];
  actionPermissions: string[];
}

/* layout module */
export interface LayoutState {
  menuMode: MenuModeEnum;
  menuTree: MenuTree;
  selectedMenuKeyPath: string[];
  pageTabs: TabInfo[];
  currentTabIndex: number;
  cachedRoutes: Set<string>;
  adminLayoutEl: Nullable<HTMLElement>;
  isFullscreen: boolean;
}

export interface TabInfo {
  route: string;
  title: string;
  cache: boolean;
}

// 权限树
// export type PerTree = PerTreeNode[];

// export interface PerTreeNode {
//   name: string; // 权限名
//   key: string; // 权限标识字符串（菜单标识符）
//   menuType: 'M' | 'C' | 'F'; // 菜单类型（M目录 C菜单 F按钮）
//   path: string; // 路由地址
//   icon: string; // 菜单图标
//   visible: 0 | 1; // 菜单显示状态（0显示 1隐藏）
//   children?: PerTreeNode[];
// }

// 菜单树
export type MenuTree = MenuItem[];

export interface MenuItem {
  title: string;
  key: string;
  url?: string; // 如果是路由或外链菜单则需要指定跳转URL
  icon?: IconProps;
  children?: MenuItem[];
}

/* pageUpdate module */
export interface PageUpdateState {
  needUpdatePageNames: Set<string>; // 需要更新数据的页面的路由name集合
}
