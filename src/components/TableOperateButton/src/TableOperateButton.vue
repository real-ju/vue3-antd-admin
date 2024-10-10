<template>
  <button class="table-operate-button" :class="[type]">
    <slot></slot>
  </button>
</template>

<script setup lang="ts" name="TableOperateButton">
const props = defineProps({
  type: {
    type: String,
    default: 'default' // danger-危险
  }
});
</script>

<style lang="less" scoped>
.table-operate-button {
  color: @primary-color;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    color: lighten(@primary-color, 30%);
  }
  &.default {
    cursor: pointer !important;
  }
  &.danger {
    color: @error-color;
    &:hover {
      color: lighten(@error-color, 20%);
    }
  }
}
</style>
