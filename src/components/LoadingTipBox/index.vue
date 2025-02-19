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

const props = defineProps({
  height: {
    type: String,
    default: null
  },
  bgColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.5)'
  },
  float: {
    type: Boolean,
    default: false
  }
});

const boxHeight = computed(() => {
  return props.height ? props.height : props.float ? '100%' : '200px';
});

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px'
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
