<template>
  <Popover>
    <template #content>
      <div class="popover-content">
        <slot name="content">
          <template v-if="fullContentType === 'array'">
            <div v-for="(item, index) in fullContent" :key="index">
              {{ item }}
            </div>
            <div v-if="fullContent.length === 0">-</div>
          </template>
          <div v-else>
            {{ fullContent || '-' }}
          </div>
        </slot>
      </div>
    </template>
    <span class="content">
      <slot>
        <span v-if="shortContentType === 'ellipsisTag'">
          <span>{{ shortContent[0] || '-' }}</span>
          <Tag v-if="shortContent.length > 1" style="margin-left: 5px">
            +{{ shortContent.length - 1 }}
          </Tag>
        </span>
        <span v-else>{{ shortContent || '-' }}</span>
      </slot>
    </span>
  </Popover>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Popover, Tag } from 'ant-design-vue/es';

defineOptions({
  name: 'WrapPopover'
});

const props = defineProps({
  // 【扩展属性】
  // 内容
  data: {
    type: [String, Array],
    default: ''
  },
  // 内容为类数组字符串
  arrayLike: {
    type: Boolean,
    default: false
  },
  // 类数组字符串分割符
  arrayLikeSplit: {
    type: String,
    default: ','
  }
});

const fullContentType = computed(() => {
  return Array.isArray(props.data) || props.arrayLike ? 'array' : 'string';
});

const fullContent = computed(() => {
  return props.arrayLike ? (props.data as string).split(props.arrayLikeSplit) : props.data;
});

const shortContentType = computed(() => {
  return Array.isArray(props.data) || props.arrayLike ? 'ellipsisTag' : 'string';
});

const shortContent = computed(() => {
  return props.arrayLike ? (props.data as string).split(props.arrayLikeSplit) : props.data;
});
</script>

<style lang="less" scoped>
.popover-content {
  max-width: 600px;
  max-height: 70vh;
  overflow-y: auto;
  word-wrap: break-word;
  word-break: keep-all;
}

.content {
  cursor: default;
}
</style>
