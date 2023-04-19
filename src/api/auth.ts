import { httpRequester } from '/@/utils/http/axios';

enum Api {
  // 获取用户信息
  getUserInfo = '/xxx'
}

export const getUserInfo = () =>
  httpRequester.get({
    url: Api.getUserInfo
  });
