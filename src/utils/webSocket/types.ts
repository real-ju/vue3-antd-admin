export interface ConstructorConfig {
  // wss url
  url: string;
  // 是否自动连接
  autoConnect?: boolean;
  // 获取token字符串，为空则表示未登录
  getToken: () => string | null | undefined;
}

export enum SendMsgType {
  MESSAGE = 'message',
  HEART = 'heart'
}

export type SubscribeFunc = (data: any) => void; // data 服务器返回的数据
