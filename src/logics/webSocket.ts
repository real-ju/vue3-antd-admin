import type { ConstructorConfig } from '/@/utils/webSocket/types';

import { WebSocketRequester } from '/@/utils/webSocket/Requester';

export function createWebSocketRequester(config: ConstructorConfig) {
  return new WebSocketRequester(config);
}
