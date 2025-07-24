<template>
  <a-tag
    :color="colorDataType === 'string' ? color : undefined"
    :class="{ 'custom-color-tag': colorDataType === 'object' }"
    :style="
      colorDataType === 'object'
        ? {
            '--text-color': color.text,
            '--bg-color': color.bg,
            '--border-color': color.border
          }
        : undefined
    "
  >
    <slot></slot>
  </a-tag>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import { computed } from 'vue';

defineOptions({
  name: 'WrapTag'
});

type ColorData =
  | string
  | {
      text: string;
      bg: string;
      border: string;
    };

const props = defineProps({
  // 【重写属性】
  color: {
    type: [String, Object] as PropType<ColorData>,
    default: undefined
  }
});

const colorDataType = computed(() => {
  return typeof props.color;
});
</script>

<style lang="less" scoped>
.custom-color-tag {
  color: var(--text-color);
  background-color: var(--bg-color);
  border-color: var(--border-color);
}
</style>
