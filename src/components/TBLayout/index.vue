<template>
  <div class="tb-layout">
    <div class="top-area" v-if="$slots.top">
      <slot name="top"></slot>
    </div>
    <div class="bottom-area">
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'TBLayout'
});
</script>

<style lang="less" scoped>
.tb-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .top-area {
    width: 100%;
    flex: none;
    margin-bottom: 16px;
  }
  .bottom-area {
    width: 100%;
    height: 0px;
    flex: 1;
  }
  :deep {
    .basic-page-card {
      height: 100%;
    }
    // 后续删除
    ._basic-page-card {
      height: 100%;
    }
  }
}
</style>
