<template>
  <BasicModal :confirmBtnProps="{ danger: danger }">
    <slot></slot>
  </BasicModal>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import {
  useBasicModal,
  getModalProps,
  modalEmits
} from '@cqcdi/core-hooks/component/useBasicModal';

defineOptions({
  name: 'SimpleModal'
});

const props = defineProps({
  ...getModalProps(),
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 危险色
  danger: {
    type: Boolean,
    default: false
  },
  // 确定按钮加载中
  loading: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits([...modalEmits, 'modalConfirm']);

const { BasicModal, modalLoading, confirmBtnLoading, closeModal } = useBasicModal(
  {
    title: props.title,
    onModalConfirm: () => {
      emit('modalConfirm');
    }
  },
  { props, emit }
);

confirmBtnLoading.value = props.loading;
watch(
  () => props.loading,
  (val) => {
    confirmBtnLoading.value = val;
  }
);
</script>

<style lang="less" scoped></style>
