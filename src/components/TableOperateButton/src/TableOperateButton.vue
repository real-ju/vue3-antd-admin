<template>
  <button
    class="table-operate-button"
    :class="[type, disabled ? 'disabled' : '']"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineOptions({
  name: 'TableOperateButton'
});

const props = defineProps({
  type: {
    type: String,
    default: 'default' // danger-危险
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<style lang="less" scoped>
@import '../../../theme.less';

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
  &.disabled {
    color: @text-color !important;
    opacity: 0.5;
    cursor: not-allowed !important;
  }
}
</style>
