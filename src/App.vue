<template>
  <a-config-provider :locale="zhCN" :getPopupContainer="getPopupContainer">
    <router-view></router-view>
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { useLayoutStore } from '/@/store/modules/layout';

const route = useRoute();
const layoutStore = useLayoutStore();
const { adminLayoutEl } = storeToRefs(layoutStore);

const getPopupContainer = computed(() => {
  const layoutMatched = route.matched[0];
  if (!layoutMatched) {
    return () => document.body;
  }
  return () => adminLayoutEl.value;
});
</script>

<style lang="less" scoped></style>
