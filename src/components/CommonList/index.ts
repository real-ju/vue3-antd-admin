import type { App } from 'vue';
import type { BasicTableConfig } from '@cqcdi/core-hooks/component/useBasicTable';

import CommonList from './index.vue';
import { setDefaultConfig } from '@cqcdi/core-hooks/component/useBasicTable';

CommonList.install = (app: App, config: Partial<BasicTableConfig> = {}) => {
  setDefaultConfig(config);
  app.component(CommonList.name!, CommonList);
};

export default CommonList;
