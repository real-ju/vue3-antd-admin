import { RouteHistoryModeEnum, RoutePermissionModeEnum } from '/@/enums/appEnum';
import { MenuModeEnum } from '/@/enums/layoutEnum';

export interface ProjectSetting {
  routeHistoryMode: RouteHistoryModeEnum;
  routePermissionMode: RoutePermissionModeEnum;
  showPageTitleSuffix: boolean;
  iconfontUrl: string;
}

export interface LayoutSetting {
  menuMode: MenuModeEnum;
  hiddenMixTopMenuKeys: string[];
  flatDirKeys: string[];
}
