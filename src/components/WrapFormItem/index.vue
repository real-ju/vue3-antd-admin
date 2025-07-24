<template>
  <a-form-item>
    <slot></slot>
  </a-form-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WrapFormItem'
});
</script>

<style lang="less" scoped></style>
