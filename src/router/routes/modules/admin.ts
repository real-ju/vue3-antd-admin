import type { RouteRecordRaw } from 'vue-router';

const admin: RouteRecordRaw = {
  path: '/',
  name: 'admin',
  meta: {
    title: 'Admin',
    public: false
  },
  component: () => import('../../../layouts/admin/index.vue'),
  children: [
    {
      path: 'test',
      name: 'test',
      meta: {
        title: '测试'
      },
      component: () => import('../../../views/test/index.vue')
    }
  ]
};

export default admin;
