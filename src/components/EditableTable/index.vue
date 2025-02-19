<template>
  <div
    class="editable-table"
    :class="{ scroll: tableProps.scroll?.y !== undefined }"
    v-if="tableProps && tableProps.columns && tableProps.dataSource"
  >
    <Form ref="formRef" autocomplete="off" :model="tableProps.dataSource">
      <Table v-bind="tableProps" size="middle" :pagination="false" bordered :scroll="tableScroll">
        <template #headerCell="{ column }">
          <slot :name="`col-${column.key}-header`">
            <template v-if="column.required">
              <span>
                <span class="warning-color">*</span>
                {{ column.title }}
              </span>
            </template>
          </slot>
        </template>
        <template #bodyCell="{ column, record, index }">
          <FormItem
            v-if="column.key && column.editComp"
            :name="[index, column.key]"
            :rules="getFormItemRules(index, column.key)"
          >
            <component
              :is="compMap[getEditComp(column, { column, record, index }).type]"
              v-model:value="record[column.key]"
              v-bind="getEditComp(column, { column, record, index }).props || {}"
              v-on="getEditComp(column, { column, record, index }).on || {}"
            >
              <slot :name="`col-${column.key}-comp-slot`"></slot>
            </component>
          </FormItem>
          <template v-else-if="$slots[`col-${column.key}-cell`]">
            <FormItem class="slot-column-form-item" :name="[index, column.key]">
              <slot
                :name="`col-${column.key}-cell`"
                :column="column"
                :record="record"
                :index="index"
              >
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
import type { ColumnsType } from 'ant-design-vue/es/table';

import { ref, computed, nextTick } from 'vue';
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
        columns: ColumnsType &
          Array<{
            key: string;
            required?: boolean;
            editComp?:
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

const getFormItemRules = (index: number, name: string) => {
  if (!props.rules) {
    return null;
  }
  if (typeof props.rules === 'function') {
    const dataSource = props.tableProps.dataSource;
    if (!dataSource) {
      return null;
    }
    return props.rules({
      record: dataSource[index],
      index
    })?.[name];
  } else {
    return props.rules[name];
  }
};

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

// 行重新验证
const rowReValidate = (rowIndex: number) => {
  nextTick(() => {
    props.tableProps.columns.forEach((item) => {
      formRef.value.clearValidate([[rowIndex, item.key]]);
      formRef.value.validate([[rowIndex, item.key]]);
    });
  });
};

defineExpose({
  formRef,
  addRecord,
  rowReValidate
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
                .ant-table-cell {
                  padding-top: 12px;
                  padding-bottom: 12px;
                }
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
