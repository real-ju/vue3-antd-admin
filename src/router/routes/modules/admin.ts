import type { RouteRecordRaw } from 'vue-router';

import { asyncLayoutImport, asyncViewImport } from '/@/router/helper/asyncComponentImport';

const admin: RouteRecordRaw = {
  path: '/',
  name: 'admin',
  meta: {
    title: 'Admin',
    public: false
  },
  component: asyncLayoutImport('admin/index.vue'),
  children: [
    {
      path: 'test',
      name: 'test',
      meta: {
        title: '测试'
      },
      component: asyncViewImport('test/index.vue')
    }
  ]
};

export default admin;
