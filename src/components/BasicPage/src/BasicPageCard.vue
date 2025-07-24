<template>
  <div class="_basic-page-card" :class="{ 'no-padding': noPadding }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  noPadding: {
    type: Boolean,
    default: false
  }
});
</script>

<style lang="less" scoped>
._basic-page-card {
  width: 100%;
  background-color: #ffffff;
  padding: 18px;
  border-radius: 4px;
  overflow: hidden;
  &.no-padding {
    padding: 0px;
  }
}
</style>
