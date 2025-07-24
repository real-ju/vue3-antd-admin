<template>
  <a-form ref="formRef" :model="model" autocomplete="off">
    <slot></slot>
  </a-form>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { Recordable } from '@cqcdi/core-types';

import { ref } from 'vue';
import { cloneDeep } from 'lodash-es';

defineOptions({
  name: 'WrapForm'
});

const props = defineProps({
  // 【重写属性】
  model: {
    type: Object as PropType<Recordable>,
    default: () => {
      return {};
    }
  },
  // 【扩展属性】
  // 默认model值，重置表单时使用。如果没传入则使用model的初始值
  defaultModel: {
    type: Object as PropType<Recordable>
  }
});

const emit = defineEmits(['update:model']);

const _defaultModel = props.defaultModel ? cloneDeep(props.defaultModel) : cloneDeep(props.model);

if (props.defaultModel) {
  emit('update:model', cloneDeep(props.defaultModel));
}

const formRef = ref();

const resetForm = () => {
  emit('update:model', cloneDeep(_defaultModel));
  formRef.value && formRef.value.clearValidate();
};

defineExpose({
  formRef,
  resetForm
});
</script>

<style lang="less" scoped></style>
