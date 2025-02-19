import { usePermissionStore } from '/@/store/modules/permission';

/**
 * 功能权限鉴权
 * @param per 权限字符串
 */
export function checkPermission(per: string | string[]): boolean {
  const permissionStore = usePermissionStore();
  const actionPermissions = permissionStore.actionPermissions;

  if (Array.isArray(per)) {
    return per.every((item) => actionPermissions.includes(item));
  } else {
    return actionPermissions.includes(per);
  }
}

/**
 * 子系统访问权限鉴权
 * @param pkg 子系统标识
 */
export function checkAppPermission(pkg: string): boolean {
  const permissionStore = usePermissionStore();
  const appPermissions = permissionStore.appPermissions;

  return appPermissions.includes(pkg);
}
