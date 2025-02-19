<template>
  <BasicModal
    v-bind="basicModalProps"
    :confirmBtnProps="{ danger: danger }"
    v-on="basicModalEvents"
  >
    <slot></slot>
  </BasicModal>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useBasicModal, getModalProps, modalEmits } from '../../hooks/component/useBasicModal';

const props = defineProps({
  ...getModalProps(),
  title: {
    type: String,
    default: ''
  },
  danger: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits([...modalEmits]);

const { basicModalProps, basicModalEvents, modalLoading, confirmBtnLoading, closeModal } =
  useBasicModal(
    {
      title: props.title,
      onModalConfirm: () => {}
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
