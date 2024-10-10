<template>
  <div
    class="editable-table"
    :class="{ scroll: props.tableProps.scroll?.y !== undefined }"
    v-if="tableProps && tableProps.columns && tableProps.dataSource"
  >
    <Form ref="formRef" autocomplete="off" :model="tableProps.dataSource" :rules="formRules">
      <Table
        v-bind="props.tableProps"
        size="middle"
        :pagination="false"
        bordered
        :scroll="tableScroll"
      >
        <template #headerCell="{ column }">
          <template v-if="column.required">
            <span>
              <span class="warning-color">*</span>
              {{ column.title }}
            </span>
          </template>
        </template>
        <template #bodyCell="{ column, record, index }">
          <FormItem v-if="column.key && column.editComp" :name="[index, column.key]">
            <component
              :is="compMap[getEditComp(column, { column, record, index }).type]"
              v-model:value="record[column.key]"
              v-bind="getEditComp(column, { column, record, index }).props || {}"
              v-on="getEditComp(column, { column, record, index }).on || {}"
            >
              <slot :name="`col-${column.key}-comp-slot`"></slot>
            </component>
          </FormItem>
          <template v-else-if="$slots[`col-${column.key}`]">
            <FormItem class="slot-column-form-item" :name="[index, column.key]">
              <slot :name="`col-${column.key}`" :column="column" :record="record" :index="index">
              </slot>
            </FormItem>
          </template>
        </template>
      </Table>
    </Form>
    <div class="add-action-row" v-if="!hideAddAction" @click="addRecord">
      <Icon type="ant" name="PlusOutlined"></Icon>
      新增一行
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { TableProps } from 'ant-design-vue/es';

import { ref, computed } from 'vue';
import { Table, Input, InputNumber, Select, AutoComplete, Form, FormItem } from 'ant-design-vue/es';

const compMap: Record<string, any> = {
  input: Input,
  'input-number': InputNumber,
  select: Select,
  'auto-complete': AutoComplete
};

interface EditCompConfig {
  type: 'input' | 'input-number' | 'select' | 'auto-complete';
  props?: Object; // 传给v-bind
  on?: Object; // 传给v-on
}

const props = defineProps({
  tableProps: {
    type: Object as PropType<
      TableProps & {
        columns: Array<{
          key: string;
          required: boolean;
          editComp:
            | EditCompConfig
            | ((cellData: {
                column: Recordable;
                record: Recordable;
                index: number;
              }) => EditCompConfig);
        }>;
      }
    >,
    default: null
  },
  rules: {
    type: Object as PropType<
      Recordable | ((data: { record: Recordable; index: number }) => Recordable)
    >,
    default: null
  },
  hideAddAction: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['addRecord']);

const formRef = ref();

const tableScroll = computed(() => {
  const scroll = props.tableProps.scroll;
  if (scroll) {
    scroll.y = 0;
    return scroll;
  } else {
    return { y: 0 };
  }
});

const formRules = computed<any>(() => {
  if (!props.rules || !props.tableProps.dataSource) {
    return null;
  }
  const dataSource = props.tableProps.dataSource;
  const rules: Recordable[] = [];
  for (let index = 0; index < dataSource.length; index++) {
    if (typeof props.rules === 'function') {
      rules.push(
        props.rules({
          record: dataSource[index],
          index
        })
      );
    } else {
      rules.push(props.rules);
    }
  }
  return rules;
});

const getEditComp = (column: Recordable, cellData: Recordable) => {
  if (typeof column.editComp === 'function') {
    return column.editComp(cellData);
  }
  return column.editComp;
};

const addRecord = () => {
  const push = (record: Recordable) => {
    props.tableProps.dataSource?.push(record);
  };
  emit('addRecord', push);
};

defineExpose({
  formRef,
  addRecord
});
</script>

<style lang="less" scoped>
.editable-table {
  width: 100%;
  &.scroll {
    height: 100%;
  }
  :deep {
    .ant-form {
      width: 100%;
      height: 100%;
      .ant-form-item {
        margin-bottom: 0px;
        position: relative;
        .ant-form-item-explain {
          position: absolute;
          top: 100%;
          left: 0px;
          z-index: 1;
          min-height: unset;
          height: 12px;
          font-size: 12px;
          line-height: 1;
          overflow: hidden;
        }
      }
    }
    .ant-table-wrapper {
      width: 100%;
      height: 100%;
      .ant-spin-nested-loading {
        height: 100%;
        .ant-spin-container {
          height: 100%;
          .ant-table {
            height: 100%;
            .ant-table-container {
              height: 100%;
              display: flex;
              flex-direction: column;
              .ant-table-header {
                flex: none;
                .ant-table-cell {
                  padding: 13px;
                }
              }
              .ant-table-body {
                height: 0px;
                flex: 1;
                max-height: unset !important;
                overflow-y: auto !important;
                .ant-table-placeholder {
                  display: none;
                }
              }
            }
          }
        }
      }
    }
  }
  .slot-column-form-item {
    :deep {
      .ant-form-item-control-input {
        min-height: 0px;
      }
    }
  }
  .add-action-row {
    width: 100%;
    font-size: 11px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #f0f0f0;
    border-top: none;
    padding: 4px 0px;
    color: #666666;
    cursor: pointer;
    transition: background-color 0.2s;
    &:hover {
      background-color: #fafafa;
    }
    .anticon {
      margin-right: 4px;
    }
  }
}
</style>
