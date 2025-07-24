import type { AxiosRequestConfig } from 'axios';
import type { RequestOptions } from '/@/utils/http/axios/types';

import { Requester } from '/@/utils/http/axios/Requester';
import { useUserStore } from '/@/store/modules/user';
import { getEnv } from '/@/utils/env';

function createRequester(config: AxiosRequestConfig = {}, options: RequestOptions = {}) {
  return new Requester(config, options);
}

export const httpRequester = createRequester(
  {
    baseURL: getEnv().VITE_API_BASE_URL
  },
  {
    validateCustomStatus: (response) => {
      if (response.request.responseType === 'blob') {
        return response.data instanceof Blob && response.data.type !== 'application/json';
      }
      const code = response.data?.code;
      return code === 200 || false;
    },
    getToken: () => {
      const userStore = useUserStore();
      return userStore.getToken;
    },
    handleUnauthorized: () => {
      const userStore = useUserStore();
      userStore.logout();
    }
  }
);

/**
 * 从响应中获取下载文件名
 */
export function getDownloadFileName(response: any) {
  const contentDisposition: string = response.headers['content-disposition'];
  if (!contentDisposition) {
    return '';
  }
  const found = contentDisposition.match(/(filename=(\S+);)|(filename=(\S+)$)/);
  return found ? decodeURIComponent(found[2] || found[4]) : '';
}
