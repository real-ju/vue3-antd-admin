<template>
  <div class="fit-box" :style="fitBoxStyle" ref="fitBoxRef">
    <div
      v-if="ready"
      class="content-box"
      :style="{ width: width, height: height, '--scale': scale, ...contentBoxStyle }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { throttle } from '@cqcdi/core-utils';

defineOptions({
  name: 'FitBox'
});

const props = defineProps({
  width: {
    type: Number,
    default: 1920
  },
  height: {
    type: Number,
    default: 1080
  },
  direction: {
    type: String,
    default: 'center' // start end
  }
});

const fitBoxRef = ref();
const ready = ref(false);

const scale = ref(1);
const fitBoxStyle = ref();
const contentBoxStyle = ref({
  transformOrigin: 'center center'
});

const contentAspectRatio = computed(() => {
  return props.width / props.height;
});

const computeScale = () => {
  const containerWidth = fitBoxRef.value.clientWidth;
  const containerHeight = fitBoxRef.value.clientHeight;
  const containerAspectRatio = containerWidth / containerHeight;
  if (containerAspectRatio > contentAspectRatio.value) {
    if (props.direction === 'center') {
      fitBoxStyle.value = undefined;
    } else {
      fitBoxStyle.value = `justify-content: flex-${props.direction}`;
    }
    if (props.direction === 'center') {
      contentBoxStyle.value = {
        transformOrigin: 'center center'
      };
    } else {
      contentBoxStyle.value = {
        transformOrigin: `${props.direction === 'start' ? 'left' : 'right'} center`
      };
    }
    scale.value = containerHeight / props.height;
  } else {
    if (props.direction === 'center') {
      fitBoxStyle.value = undefined;
    } else {
      fitBoxStyle.value = `align-items: flex-${props.direction}`;
    }
    if (props.direction === 'center') {
      contentBoxStyle.value = {
        transformOrigin: 'center center'
      };
    } else {
      contentBoxStyle.value = {
        transformOrigin: `center ${props.direction === 'start' ? 'top' : 'bottom'}`
      };
    }
    scale.value = containerWidth / props.width;
  }
};
const throttledComputeScale = throttle(computeScale, 1000);

const { width: windowWidth, height: windowHeight } = useWindowSize();

watch([windowWidth, windowHeight], () => {
  throttledComputeScale();
});

onMounted(() => {
  computeScale();
  ready.value = true;
});
</script>

<style lang="less" scoped>
.fit-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  .content-box {
    transform-origin: center center;
    transform: scale(var(--scale));
    transition: transform 0.2s;
  }
}
</style>
