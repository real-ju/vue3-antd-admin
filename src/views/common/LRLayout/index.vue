<template>
  <a-row
    class="lr-layout"
    :class="{ 'split-line': gutter === 0, 'fixed-container-height': fixedContainerHeight }"
    :gutter="[gutter, 16]"
  >
    <a-col :span="24" :xl="leftSpan">
      <slot name="left"></slot>
    </a-col>
    <a-col :span="24" :xl="rightSpan">
      <slot name="right"></slot>
    </a-col>
  </a-row>
</template>

<script setup lang="ts" name="VLRLayout">
const props = defineProps({
  leftSpan: {
    type: Number,
    default: 12
  },
  rightSpan: {
    type: Number,
    default: 12
  },
  gutter: {
    type: Number,
    default: 16
  },
  fixedContainerHeight: {
    type: Boolean,
    default: true
  }
});
</script>

<style lang="less" scoped>
.lr-layout {
  width: 100%;
  &.split-line {
    .ant-col + .ant-col {
      border-left: 1px solid #cccccc;
    }
  }
  &.fixed-container-height {
    height: 100%;
    .ant-col {
      height: 100%;
    }
  }
  :deep {
    .basic-page-card {
      height: 100%;
    }
  }
}
</style>
