import type { Ref } from 'vue';

import { createWebSocketRequester } from '/@/utils/webSocket';
import { useUserStore } from '/@/store/modules/user';
import { getEnv } from '/@/utils/env';

const { VITE_WS_URL, PKG } = getEnv();

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

    const url = `${VITE_WS_URL}${PKG}?token=${userStore.getToken}`;
    requester.value = createWebSocketRequester({
      url
    });

    return requester;
  };

  return {
    requester,
    open
  };
}
