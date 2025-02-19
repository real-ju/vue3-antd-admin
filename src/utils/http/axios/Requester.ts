import type { AxiosInstance } from 'axios';
import type {
  RequestOptions,
  ExpandRequestConfig,
  FullExpandRequestConfig,
  RequestParams,
  UploadFileParams
} from './types';

import axios from 'axios';
import { axiosRequestConfig } from './config';
import { useUserStore } from '/@/store/modules/user';
import { RequestMethodEnum, ContentTypeEnum } from '/@/enums/httpEnum';
import qs from 'qs';

export class Requester {
  private axiosRequestConfig: FullExpandRequestConfig; // 实例请求配置
  private axiosInstance: AxiosInstance;

  constructor(options: RequestOptions = {}) {
    this.axiosRequestConfig = this.computeAxiosRequestConfig(axiosRequestConfig, options);
    this.axiosInstance = axios.create(this.axiosRequestConfig);
    this.setupInterceptors();
  }

  private computeAxiosRequestConfig(
    config: FullExpandRequestConfig,
    options: RequestOptions
  ): FullExpandRequestConfig {
    Object.assign(config.requestOptions!, options);
    return config;
  }

  private handleResponseError(response: any): void {
    const code = +response.data.code;
    if (code === 401) {
      const userStore = useUserStore();
      userStore.logout(false, true);
    }

    const requestOptions: Required<RequestOptions> = response.config.requestOptions;
    const handleCustomError = requestOptions.handleCustomError;

    handleCustomError &&
      handleCustomError(response, {
        showErrorTip: requestOptions.showCustomErrorTip
      });
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      // @ts-ignore
      (config: FullExpandRequestConfig) => {
        config.headers = config.headers || {};

        const requestOptions = config.requestOptions;

        // handle token
        const userStore = useUserStore();
        const customToken = requestOptions.customToken;
        if (requestOptions.auth && (userStore.isLogin || customToken)) {
          config.headers[requestOptions.authHeader] = customToken
            ? customToken
            : 'Bearer ' + userStore.getToken;
        }

        // handle ContentType
        const contentType = (config.headers['Content-Type'] = requestOptions.contentType);

        if (
          contentType === ContentTypeEnum.FORM_URLENCODED &&
          config.method !== RequestMethodEnum.GET &&
          Reflect.has(config, 'data')
        ) {
          config.data = qs.stringify(config.data, { arrayFormat: 'brackets' });
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const requestOptions = (response.config as FullExpandRequestConfig).requestOptions;

        if (requestOptions.validateCustomStatus(response)) {
          return response;
        } else {
          this.handleResponseError(response);
          return Promise.reject(response);
        }
      },
      (error) => {
        const requestOptions = (error.response.config as FullExpandRequestConfig).requestOptions;

        if (error.code === 'ECONNABORTED') {
          // 请求超时 重新发起请求
          return new Promise((resolve, reject) => {
            this.axiosInstance
              .request(error.config)
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          });
        } else if (error.response) {
          this.handleResponseError(error.response);
          return Promise.reject(error);
        }
      }
    );
  }

  uploadFile(params: UploadFileParams, options?: RequestOptions) {
    const formData = new FormData();

    if (params.file) {
      const customFileName = params.name || 'file';
      const files = ([] as Blob[]).concat(params.file);
      const nameField = !Array.isArray(params.file)
        ? customFileName
        : `${customFileName}${params.arrayKeyType === 2 ? '[]' : ''}`;
      files.forEach((file) => {
        if (params.filename) {
          formData.append(nameField, file, params.filename);
        } else {
          formData.append(nameField, file);
        }
      });
    }

    if (params.data) {
      Object.keys(params.data).forEach((key) => {
        const value = params.data![key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}${params.arrayKeyType === 2 ? '[]' : ''}`, item);
          });
        } else {
          formData.append(key, value);
        }
      });
    }

    options = options || {};

    const requestParams: RequestParams = {
      url: params.url,
      method: RequestMethodEnum.POST,
      data: formData,
      ...(params.extraRequestParams || {})
    };
    if (params.onUploadProgress) {
      requestParams.onUploadProgress = (progressEvent: any) => {
        let progress = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
        if (progress === 100) {
          progress = 99;
        }
        params.onUploadProgress!(progress);
      };
    }

    return this.request(requestParams, {
      ...options,
      contentType: ContentTypeEnum.FORM_DATA
    }).then((res) => {
      params.onUploadProgress?.(100);
      return res;
    });
  }

  get(requestParams: Omit<RequestParams, 'method'>, options?: RequestOptions) {
    return this.request(
      {
        ...requestParams,
        method: RequestMethodEnum.GET
      },
      options
    );
  }

  post(requestParams: Omit<RequestParams, 'method'>, options?: RequestOptions) {
    return this.request(
      {
        ...requestParams,
        method: RequestMethodEnum.POST
      },
      options
    );
  }

  put(requestParams: Omit<RequestParams, 'method'>, options?: RequestOptions) {
    return this.request(
      {
        ...requestParams,
        method: RequestMethodEnum.PUT
      },
      options
    );
  }

  delete(requestParams: Omit<RequestParams, 'method'>, options?: RequestOptions) {
    return this.request(
      {
        ...requestParams,
        method: RequestMethodEnum.DELETE
      },
      options
    );
  }

  request(requestParams: RequestParams, options?: RequestOptions) {
    const { url, method, data, ...restParams } = requestParams;

    return new Promise<any>((resolve, reject) => {
      const config: ExpandRequestConfig = {
        url,
        method,
        ...restParams,
        requestOptions: options // axios auto deep marge
      };

      if (method === RequestMethodEnum.GET) {
        config.params = data;
      } else {
        config.data = data;
      }

      this.axiosInstance
        .request(config)
        .then((res) => {
          if (!config.responseType) {
            resolve(res.data);
          } else {
            resolve(res);
          }
        })
        .catch((error) => {
          reject(error.response || error);
        });
    });
  }
}
