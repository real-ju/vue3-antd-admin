import type { Ref } from 'vue';

import { useUserStore } from '/@/store/modules/user';
import { getEnv } from '/@/utils/env';
import { createWebSocketRequester } from '/@/logics/webSocket';

const { VITE_WS_URL, MODE } = getEnv();

let requester: Ref<any> = ref<any>(null);

/**
 * 全局WebSocket通知
 */
export function useNoticeWS() {
  const userStore = useUserStore();

  const open = () => {
    if (!userStore.isLogin) {
      return;
    }
    if (requester.value) {
      return;
    }

    let url = '';
    if (MODE === 'development') {
      url = `${VITE_WS_URL}?token=${userStore.getToken}`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      url = `${protocol}://${window.location.host}${VITE_WS_URL}?token=${userStore.getToken}`;
    }
    requester.value = createWebSocketRequester({
      url,
      getToken: () => {
        return userStore.getToken;
      }
    });

    return requester;
  };

  return {
    requester,
    open
  };
}
