<template>
  <div
    class="loading-tip-box"
    :class="{ float: float }"
    :style="{ height: boxHeight, backgroundColor: bgColor }"
  >
    <Spin :indicator="indicator" />
  </div>
</template>

<script setup lang="ts">
import { Spin } from 'ant-design-vue/es';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { computed, h } from 'vue';

defineOptions({
  name: 'LoadingTipBox'
});

const props = defineProps({
  // 块高度
  height: {
    type: String,
    default: null
  },
  // 块背景色
  bgColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.5)'
  },
  // 开启position: absolute（父节点设置position: relative）
  float: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: undefined
  },
  size: {
    type: Number,
    default: 24
  }
});

const boxHeight = computed(() => {
  return props.height ? props.height : props.float ? '100%' : '200px';
});

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: `${props.size}px`,
    color: props.color
  },
  spin: true
});
</script>

<style lang="less" scoped>
.loading-tip-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &.float {
    position: absolute;
    top: 0px;
    left: 0px;
  }
}
</style>
