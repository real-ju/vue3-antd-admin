/**
 * 路由历史模式
 * https://router.vuejs.org/zh/guide/essentials/history-mode.html
 */
export enum RouteHistoryModeEnum {
  HASH = 'hash',
  HTML5 = 'html5'
}

/**
 * 路由权限模式
 */
export enum RoutePermissionModeEnum {
  // 本地管理路由
  LOCAL = 'local',

  // 后端管理鉴权路由
  SAFETY = 'safety'
}
