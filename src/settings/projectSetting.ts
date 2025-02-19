import type { ProjectSetting, StatusColorSetting } from '/#/config';

import { RouteHistoryModeEnum, RoutePermissionModeEnum } from '/@/enums/appEnum';
import globalThemeVars from '/@/design/theme/default/globalVars';

const setting: ProjectSetting = {
  // 路由历史模式
  routeHistoryMode: RouteHistoryModeEnum.HTML5,
  // 路由权限模式
  routePermissionMode: RoutePermissionModeEnum.SAFETY,
  // 网页标题后缀
  showPageTitleSuffix: true,
  // 使用IconFont的图标配置
  iconfontUrl: 'https://at.alicdn.com/t/c/font_3373343_xic7ab2dkh9.js'
};

const statusColorSetting: StatusColorSetting = {
  default: globalThemeVars.primaryColor,
  success: globalThemeVars.successColor,
  processing: globalThemeVars.infoColor,
  warning: globalThemeVars.warningColor,
  error: globalThemeVars.errorColor,
  disabled: globalThemeVars.disabledColor
};

export default setting;
export { statusColorSetting };
