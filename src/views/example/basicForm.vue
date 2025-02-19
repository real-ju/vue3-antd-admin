<template>
  <a-form v-bind="formProps">
    <a-form-item label="xxx" name="xxx">
      <a-input v-model:value="formModel.xxx" placeholder="请输入" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { useBasicForm } from '/@/hooks/component/useBasicForm';

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
