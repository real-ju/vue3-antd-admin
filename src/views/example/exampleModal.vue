<template>
  <BasicModal v-bind="basicModalProps" v-on="basicModalEvents">xxx</BasicModal>
</template>

<script setup lang="ts">
import { useBasicModal, getModalProps, modalEmits } from '/@/hooks/component/useBasicModal';

const props = defineProps({
  ...getModalProps()
});
const emit = defineEmits([...modalEmits]);

const { basicModalProps, basicModalEvents, modalLoading, confirmBtnLoading, closeModal } =
  useBasicModal(
    {
      title: '基本对话框',
      onModalConfirm: () => {}
    },
    { props, emit }
  );
</script>

<style lang="less" scoped></style>
