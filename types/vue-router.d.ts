import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    // 标题
    title: string;

    // 是否为开放页面（无需登录授权）
    public?: boolean;

    // 是否隐藏页面标题后缀
    hideTitleSuffix?: boolean;

    // 子路由匹配选中菜单的key值，默认使用路由name匹配
    menuMatchKey?: string;

    // 所需路由或功能权限
    per?: string | string[];

    // 鉴权模式（默认and，表示需要满足所有权限才能通过，per为数组时生效）
    perMode?: 'and' | 'or';

    // 允许自动添加页签
    allowTabControl?: boolean;

    // 路由缓存
    cache?: boolean;
  }
}
