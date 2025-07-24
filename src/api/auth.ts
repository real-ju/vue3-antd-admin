import { httpRequester } from '/@/logics/http';

enum Api {
  // 获取权限数据
  getPermissionData = '/xxx'
}

export const getPermissionData = () =>
  httpRequester.get({
    url: Api.getPermissionData
  });
