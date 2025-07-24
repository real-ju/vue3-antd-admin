declare type Recordable<T = any> = Record<string, T>;
declare type Nullable<T> = T | null;

declare type ViteEnv = Recordable<string>;

// 全局变量
declare const __VITE_ENV__: ViteEnv;
