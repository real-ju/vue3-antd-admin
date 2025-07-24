import type { ConstructorConfig, SubscribeFunc } from './types';

import { SendMsgType } from './types';
import { throttle } from '/@/utils';
import { useUserStore } from '/@/store/modules/user';

export class WebSocketRequester {
  // 配置
  config: ConstructorConfig;
  // WebSocket实例
  instance: WebSocket | null = null;
  // WebSocket准备完成
  ready: boolean = false;
  // @ts-ignore 重连
  reconnect: Function;
  // 心跳包发送定时器
  heartTimer: NodeJS.Timeout | null = null;
  // 心跳包回应超时处理定时器
  heartResponseTimer: NodeJS.Timeout | null = null;
  // 订阅消息回调函数列表
  subscribeFuncList: SubscribeFunc[] = [];

  constructor(config: ConstructorConfig) {
    this.throttleReconnect();
    this.config = config;
    if (config.autoConnect !== false) {
      this.connect();
    }
  }

  /**
   * 节流化reconnect方法，因为该方法在多个地方调用，避免引起死循环
   */
  throttleReconnect() {
    const reconnect = () => {
      if (this.heartTimer) {
        clearInterval(this.heartTimer);
      }
      if (this.heartResponseTimer) {
        clearTimeout(this.heartResponseTimer);
      }
      this.heartTimer = null;
      this.heartResponseTimer = null;
      this.instance?.close(1000);
      this.instance = null;
      this.connect();
    };
    this.reconnect = throttle(reconnect, 10000);
  }

  /**
   * 连接（创建实例）
   */
  connect() {
    if (this.instance) {
      return;
    }
    this.createWebSocket();
  }

  /**
   * 创建WebSocket
   */
  createWebSocket() {
    const userStore = useUserStore();
    const { url } = this.config;
    const header: Recordable = {};
    if (userStore.isLogin) {
      const token = userStore.getToken;
      header['Authorization'] = token;
    }
    const instance = new WebSocket(url);
    instance.onopen = this.onOpen.bind(this);
    instance.onclose = this.onClose.bind(this);
    instance.onerror = this.onError.bind(this);
    instance.onmessage = this.onMessage.bind(this);
    this.instance = instance;
    this.ready = false;
  }

  /**
   * 定时发送心跳包
   */
  initHeartCheck() {
    this.heartTimer = setInterval(() => {
      this._send('connectTest', SendMsgType.HEART);
      this.heartResponseTimer = setTimeout(() => {
        this.reconnect();
      }, 10 * 1000);
    }, 60 * 1000);
  }

  /**
   * 心跳包回应成功后清除heartResponseTimer定时器
   */
  handleHeartCheckSuccess() {
    if (this.heartResponseTimer) {
      clearTimeout(this.heartResponseTimer);
    }
  }

  onOpen() {
    this.ready = true;
    // this.initHeartCheck();
  }

  onClose(event: CloseEvent) {
    if (event.code! == 1000) {
      this.reconnect();
    }
  }

  onError(event: Event) {
    this.reconnect();
  }

  onMessage(event: MessageEvent) {
    if (!event.data) {
      return;
    }
    const data = JSON.parse(event.data);
    if (data) {
      if (data.type === 'heart') {
        this.handleHeartCheckSuccess();
      } else if (data.type === 'message') {
        this.subscribeFuncList.forEach((func) => {
          func(data.data);
        });
      }
    }
  }

  _send(data: any, type: SendMsgType = SendMsgType.MESSAGE) {
    if (!this.ready) {
      return;
    }

    this.instance?.send(
      JSON.stringify({
        type,
        data
      })
    );
  }

  /**
   * 订阅消息回调
   */
  subscribe(func: SubscribeFunc | SubscribeFunc[]) {
    if (!Array.isArray(func)) {
      func = [func];
    }
    this.subscribeFuncList.push(...func);
  }

  /**
   * 取消订阅消息回调
   */
  cancelSubscribe(func: SubscribeFunc | SubscribeFunc[]) {
    if (!Array.isArray(func)) {
      func = [func];
    }
    this.subscribeFuncList = this.subscribeFuncList.filter((item) => {
      return !(func as SubscribeFunc[]).includes(item);
    });
  }

  /**
   * 发送消息
   */
  send(data: any) {
    this._send(data, SendMsgType.MESSAGE);
  }
}
