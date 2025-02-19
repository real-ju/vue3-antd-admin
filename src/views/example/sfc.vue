<template>
  <div>
    <!-- assets中图片引用方式，src如果是变量需要import图片地址 -->
    <img src="/src/assets/images/layout/logo.png" alt="logo" />
    <!-- 基础Tooltip -->
    <a-tooltip color="#ffffff">
      <template #title>
        <span class="primary-color">xxx</span>
      </template>
      <!--Content -->
    </a-tooltip>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
// 引用全局主题变量
@import '/@common/src/design/theme/default/global.less';
</style>
