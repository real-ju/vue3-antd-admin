import { type ConditionalCompilePluginConfig } from './vite/plugin/conditionalCompile';

/**
 * 通过CLIENT字段区分的环境变量
 * 比如：VITE_API_BASE_URL
 */
export const ENVS_BY_CLIENT: string[] = [];

// 条件编译
export const CONDITIONAL_COMPILE: ConditionalCompilePluginConfig | boolean = false;
