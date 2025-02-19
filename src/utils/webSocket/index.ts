import type { ConstructorConfig } from './types';

import { WebSocketRequester } from './Requester';

export function createWebSocketRequester(config: ConstructorConfig) {
  return new WebSocketRequester(config);
}
