import type { RouteLocationNormalized } from 'vue-router';

import projectSetting from '/@/settings/projectSetting';
import { setDocTitle } from '../../utils/domUtils';
import { getEnv } from '/@/utils/env';
import { RouteHistoryModeEnum } from '/@/enums/appEnum';
import qs from 'qs';

const { routeHistoryMode } = projectSetting;

/**
 * 获取路由完整路径（HTML5历史模式下不包含Hash）
 */
export function getFullPathWithoutHash(route: RouteLocationNormalized): string {
  let fullPath = route.fullPath;
  if (routeHistoryMode === RouteHistoryModeEnum.HTML5) {
    fullPath = route.path;
    if (JSON.stringify(route.query) !== '{}') {
      fullPath += '?' + qs.stringify(route.query, { arrayFormat: 'brackets' });
    }
  }
  return fullPath;
}

/**
 * 相对url转化为路由记录name
 */
export function routePathToName(url: string) {
  return url.split('/').join('-');
}

/**
 * 设置页面标题
 */
export function setPageTitle(title: string = '', hideSuffix: boolean = false) {
  if (!hideSuffix && projectSetting.showPageTitleSuffix) {
    const APP_TITLE = getEnv().VITE_APP_TITLE;
    title += ` - ${APP_TITLE}`;
  }
  setDocTitle(title);
}
