<template>
  <div class="head-tabs" :class="{ 'with-split-line': showSplitLine }">
    <a-tabs :activeKey="activeKey" @update:activeKey="onUpdateActiveKey">
      <a-tab-pane v-for="item in list" :key="item.key" :tab="item.title"></a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

defineOptions({
  name: 'HeadTabs'
});

interface TabInfo {
  title: string;
  key: string;
}

const props = defineProps({
  list: {
    type: Array as PropType<TabInfo[]>,
    default: () => {
      return [];
    }
  },
  activeKey: {
    type: String,
    default: null
  },
  showSplitLine: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:activeKey']);

const onUpdateActiveKey = (key: string) => {
  emit('update:activeKey', key);
};
</script>

<style lang="less" scoped>
.head-tabs {
  width: 100%;
  :deep {
    .ant-tabs-nav {
      padding-left: 20px;
      margin: 0px;
      &::before {
        display: none;
        border-bottom-color: #dddddd;
      }
    }
    .ant-tabs-content-holder {
      display: none;
    }
  }
  &.with-split-line {
    :deep {
      .ant-tabs-nav {
        &::before {
          display: block;
        }
      }
    }
  }
}
</style>
