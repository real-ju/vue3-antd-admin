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

export interface StatusColorSetting {
  default: string;
  success: string;
  processing: string;
  warning: string;
  error: string;
  disabled: string;
}
