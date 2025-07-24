<template>
  <div class="precision-input">
    <InputGroup compact style="display: flex">
      <div v-if="preLabel" style="width: 120px" class="pre-label">{{ preLabel }}</div>
      <Select
        v-if="list && list.length > 0"
        :value="type"
        @update:value="onSelectValueUpdate"
        :options="list"
        :fieldNames="{ label: 'name' }"
        :style="{ width: listWidth || '100px', flex: 'none' }"
      >
      </Select>
      <Input
        :value="value"
        @update:value="onValueUpdate"
        :placeholder="placeholder"
        :style="{ borderRight: hidePrecision ? null : 'unset' }"
      >
      </Input>
      <div v-if="!hidePrecision" class="checkbox-area">
        <FormItemRest>
          <Checkbox
            :checked="isPrecision"
            @update:checked="onPrecisionValueUpdate"
            :disabled="precisionDisabled"
          >
            精确匹配
          </Checkbox>
        </FormItemRest>
      </div>
    </InputGroup>
  </div>
</template>

<script setup lang="ts">
import { InputGroup, Select, Input, FormItemRest, Checkbox } from 'ant-design-vue/es';

defineOptions({
  name: 'PrecisionInput'
});

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入，多个请用英文逗号隔开'
  },
  preLabel: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  list: {
    type: Array,
    default() {
      return [];
    }
  },
  listWidth: {
    type: String,
    default: ''
  },
  isPrecision: {
    type: Boolean,
    default: false
  },
  hidePrecision: {
    type: Boolean,
    default: false
  },
  precisionDisabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:value', 'update:type', 'update:isPrecision']);

const onSelectValueUpdate = (value: String) => {
  emit('update:type', value);
};
const onValueUpdate = (value: String) => {
  emit('update:value', value);
};

const onPrecisionValueUpdate = (value: String) => {
  emit('update:isPrecision', value);
};
</script>

<style lang="less" scoped>
.precision-input {
  width: 100%;
  display: flex;
  align-items: stretch;
  .pre-label {
    line-height: 32px;
    width: 48px;
    height: 32px;
    text-align: center;
    background: inherit;
    background-color: #304bcc4a;
    border: none;
    border-right: 0px;
    border-radius: 3px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
    box-shadow: none;
    font-size: 12px;
    color: #ffffff;
  }
  :deep(.ant-input:focus, .ant-input-focused) {
    border-color: #ced4da;
    box-shadow: unset;
  }
  :deep(.ant-input:hover) {
    border-color: #ced4da;
  }
  :deep(
      .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input)
        .ant-select-selector
    ) {
    border-color: #ced4da;
    box-shadow: unset;
  }
  :deep(.ant-select:not(.ant-select-disabled):hover .ant-select-selector) {
    border-color: #ced4da;
  }
  .input-area {
    width: 0px;
    flex: 1;
  }
  .checkbox-area {
    flex: none;
    .ant-checkbox-wrapper {
      width: 100%;
      height: 100%;
      border: 1px solid #ced4da;
      border-left: none;
      border-radius: 0px 3px 3px 0px;
      display: flex;
      align-items: center;
      padding-left: 2px;
      padding-right: 5px;
    }
  }
}
</style>
