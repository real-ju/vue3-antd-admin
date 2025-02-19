<template>
  <Row
    class="lr-layout"
    :class="{
      'split-line': $slots.left && gutter === 0,
      'fixed-container-height': fixedContainerHeight
    }"
    :gutter="[
      {
        xxl: gutter
      },
      16
    ]"
  >
    <Col :span="responsive ? 24 : leftSpan" :xxl="leftSpan">
      <slot name="left"></slot>
    </Col>
    <Col :span="responsive ? 24 : rightSpan" :xxl="rightSpan">
      <slot name="right"></slot>
    </Col>
  </Row>
</template>

<script setup lang="ts">
import { Row, Col } from 'ant-design-vue/es';

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
  // 容器高度固定，此时会将Row和Col的height设置为100%
  fixedContainerHeight: {
    type: Boolean,
    default: true
  },
  // 开启grid响应式布局
  responsive: {
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
      border-left: 1px solid #dddddd;
    }
  }
  &.fixed-container-height {
    height: 100%;
    > .ant-col {
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
