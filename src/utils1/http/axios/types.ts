import type { AxiosRequestConfig } from 'axios';

import { ContentTypeEnum, RequestMethodEnum } from '/@/enums/httpEnum';

export interface RequestOptions {
  auth?: boolean;
  contentType?: ContentTypeEnum;
  customToken?: string | false;
  authHeader?: string;
  validateCustomStatus?: (response: any) => boolean;
  handleCustomError?: CustomErrorHandler | null;
  showCustomErrorTip?: boolean;
}

interface CustomErrorHandler {
  (response: any, options: CustomErrorOptions): void;
}

interface CustomErrorOptions {
  showErrorTip: boolean;
}

export interface ExpandRequestConfig extends AxiosRequestConfig {
  requestOptions?: RequestOptions;
}

export type FullExpandRequestConfig = Omit<ExpandRequestConfig, 'requestOptions'> & {
  requestOptions: Required<RequestOptions>;
};

export type RequestParams = AxiosRequestConfig & {
  url: string;
  method: RequestMethodEnum;
  data?: any;
};

export interface UploadFileParams {
  url: string;
  // File parameter interface field name
  name?: string;
  // File data
  file?: File | Blob | File[] | Blob[];
  // File name
  filename?: string;
  // Other parameters
  data?: Recordable;
  // 数组格式数据在FormData上的key格式，1-没有[] 2-有[]
  arrayKeyType?: 1 | 2;
  // 文件上传进度回调
  onUploadProgress?: (progress: number) => void;
  // 额外的请求参数
  extraRequestParams?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>;
}
