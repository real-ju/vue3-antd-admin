<template>
  <BasicModal v-bind="basicModalProps" v-on="basicModalEvents">
    <a-form v-bind="formProps">
      <a-form-item label="xxx" name="xxx">
        <a-input v-model:value="formModel.xxx" placeholder="请输入" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
import { useBasicModal, getModalProps, modalEmits } from '/@/hooks/component/useBasicModal';
import { useBasicForm } from '/@/hooks/component/useBasicForm';

const props = defineProps({
  ...getModalProps('recordUpdate')
});
const emit = defineEmits([...modalEmits]);

const { basicModalProps, basicModalEvents, modalLoading, confirmBtnLoading, closeModal } =
  useBasicModal(
    {
      mode: 'recordUpdate',
      recordName: '数据',
      onModalOpen: () => {
        resetForm();
      },
      onModalConfirm: () => {}
    },
    { props, emit }
  );

const defaultModel = {
  xxx: ''
};

const { formProps, formRef, formModel, formRules, resetForm } = useBasicForm({
  defaultModel,
  rules: {
    xxx: [{ required: true, message: '请输入xxx' }]
  }
});
</script>

<style lang="less" scoped></style>
