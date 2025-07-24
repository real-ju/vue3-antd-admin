<template>
  <span class="_basic-link" :class="{ underline: underline }">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BasicLink'
});

const props = defineProps({
  underline: {
    type: Boolean,
    default: true
  }
});
</script>

<style lang="less" scoped>
@import '../../theme.less';

._basic-link {
  color: @link-color;
  cursor: pointer;
  &.underline {
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
