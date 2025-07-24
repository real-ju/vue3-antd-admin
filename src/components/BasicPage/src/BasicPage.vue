<template>
  <div class="_basic-page">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
@import '@cqcdi/ms-common-dev/src/design/theme/default/global.less';

._basic-page {
  width: 100%;
  min-height: 100%;
  background-color: @page-bg-color;
  padding: 18px 24px;
}
</style>
