import type { RouteRecordRaw } from 'vue-router';

const auth: RouteRecordRaw = {
  path: '/auth',
  name: 'auth',
  redirect: '/auth/login',
  meta: {
    title: 'Auth',
    public: true,
    allowTabControl: false
  },
  component: () => import('../../../layouts/auth/index.vue'),
  children: [
    {
      path: 'login',
      name: 'auth-login',
      meta: {
        title: '登陆'
      },
      component: () => import('../../../views/auth/login.vue')
    }
  ]
};

export default auth;
