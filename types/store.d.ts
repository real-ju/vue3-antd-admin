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
  // 将要清除缓存的路由fullPath
  willClearCacheRoute: Set<string>;
}

export interface TabInfo {
  route: string;
  title: string;
  cache: boolean;
}

export type MenuTree = MenuItem[];

export interface MenuItem {
  title: string;
  key: string; // 暂时使用key作为路由跳转标志，匹配路由name，外链用link:http://baidu.com
  icon?: {
    type: string;
    name: string;
  };
  children?: MenuItem[];
}
