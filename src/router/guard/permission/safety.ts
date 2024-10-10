import type { Router, RouteLocationNormalized } from 'vue-router';

import { useUserStore } from '/@/store/modules/user';
import { usePermissionStoreWithOut } from '/@/store/modules/permission';
import { BasicPageEnum, ExceptionPageEnum } from '/@/enums/pageEnum';
import { getPermissionData } from '/@/api/auth';
import { getMenuFirstLeafNode } from '/@/logics/helper/layout';
import { useLayoutStore } from '/@/store/modules/layout';
import { getEnv } from '/@/utils/env';

const { MODE } = getEnv();

const permissionStore = usePermissionStoreWithOut();

/**
 * 检查路由权限
 */
function checkRoutePermission(to: RouteLocationNormalized) {
  return true;
  // const pers: string[] = to.meta.per
  //   ? Array.isArray(to.meta.per)
  //     ? to.meta.per
  //     : [to.meta.per]
  //   : [String(to.name)];
  // const mode = to.meta.perMode || 'and';
  // let pass = mode === 'and';
  // for (let index = 0; index < pers.length; index++) {
  //   const per = pers[index];
  //   if (mode === 'and' && permissionStore.allPermissions.indexOf(per) === -1) {
  //     pass = false;
  //     break;
  //   } else if (mode === 'or' && permissionStore.allPermissions.indexOf(per) !== -1) {
  //     pass = true;
  //     break;
  //   }
  // }
  // return pass;
}

const routeWhiteList: string[] = [
  ExceptionPageEnum.EXCEPTION_403,
  ExceptionPageEnum.EXCEPTION_404,
  BasicPageEnum.REFRESH
];

export function createSafetyPermissionGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const isMatched = to.matched.length !== 0;
    if (!isMatched) {
      next(ExceptionPageEnum.EXCEPTION_404);
      return;
    }

    if (routeWhiteList.indexOf(to.path) !== -1) {
      next();
      return;
    }

    const userStore = useUserStore();
    const isLogin = userStore.isLogin;
    if (isLogin) {
      if (!permissionStore.hasFetchedPermissionData) {
        permissionStore.hasFetchedPermissionData = true;
        next(to);
        // getPermissionData()
        //   .then((res) => {
        //     const success = permissionStore.generatePermissions();
        //     if (success) {
        //       permissionStore.hasFetchedPermissionData = true;
        //       next(to);
        //     } else {
        //       throw new Error();
        //     }
        //   })
        //   .catch(() => {
        //     const error = new Error('获取权限失败');
        //     next(error);
        //   });
      } else {
        if (to.path === '/') {
          const layoutStore = useLayoutStore();
          const menuNode = getMenuFirstLeafNode(layoutStore.menuTree);
          if (menuNode) {
            next({
              name: menuNode.key
            });
          } else {
            next(ExceptionPageEnum.EXCEPTION_404);
          }
        } else if (to.path === BasicPageEnum.LOGIN) {
          next('/');
        } else {
          if (checkRoutePermission(to)) {
            next();
          } else {
            const error = new Error('没有访问权限');
            next(error);
          }
        }
      }
    } else {
      if (!to.meta.public) {
        next({
          path: BasicPageEnum.LOGIN,
          query: {
            backUrl: encodeURIComponent(to.fullPath)
          }
        });
      } else {
        next();
      }
    }
  });

  router.onError((error) => {
    if (MODE === 'production') {
      router.push(ExceptionPageEnum.EXCEPTION_403);
    }
  });
}
