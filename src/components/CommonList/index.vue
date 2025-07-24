<template>
  <div class="common-list" :class="{ 'fixed-container-height': fixedContainerHeight }">
    <div
      v-if="$slots.query && queryLayout === 'general'"
      class="query-area"
      :class="{ border: $slots.topAction }"
    >
      <slot name="query" v-bind="exposeObj"></slot>
    </div>
    <div
      v-if="$slots.topAction || ($slots.query && queryLayout === 'simple')"
      class="top-action-wrapper"
      :style="{
        paddingTop: !($slots.query && queryLayout === 'general') ? '0px' : undefined
      }"
    >
      <div class="top-action-area">
        <slot name="topAction"></slot>
      </div>
      <div class="simple-query-area" v-if="queryLayout === 'simple'">
        <slot name="query" v-bind="exposeObj"></slot>
      </div>
    </div>
    <div class="table-area inner-ant-table-striped" ref="tableAreaRef">
      <slot
        name="table"
        :defaultTableProps="defaultTableProps"
        :defaultTableEvents="defaultTableEvents"
        :tableHeight="tableHeight"
        :getStripedRowClassName="getTableStripedRowClassName"
      >
      </slot>
    </div>
    <div class="bottom-action-area">
      <slot name="bottomAction" :paginationData="paginationData">
        <div class="basic-table-pagination">
          <div class="tip" v-if="!hidePaginationTip">
            <template v-if="selectedRows"
              >当前选择
              <i>{{
                selectionFlag === 'reverse'
                  ? paginationData.total - (reverseSelectedRows?.length || 0)
                  : selectedRows.length
              }}</i>
              项，</template
            >共 <i>{{ paginationData.total }}</i> 项
          </div>
          <Pagination
            size="small"
            :total="paginationData.total"
            v-model:current="paginationData.page"
            v-model:pageSize="paginationData.pageSize"
            :pageSizeOptions="paginationData.pageSizeOptions"
            :show-size-changer="paginationData.showSizeChanger"
            show-quick-jumper
            @change="fetchTableData()"
            @showSizeChange="fetchTableData()"
          />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="tsx">
import type {
  ColumnConfig,
  HandleDataTotalFunction,
  HandleTableDataFunction,
  PaginationQueryFieldsOption
} from '@cqcdi/core-hooks/component/useBasicTable';
import type { Recordable } from '@cqcdi/core-types';
import type { PropType } from 'vue';

import { Pagination } from 'ant-design-vue/es';
import { useWindowSize } from '@vueuse/core';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useBasicTable } from '@cqcdi/core-hooks/component/useBasicTable';

defineOptions({
  name: 'CommonList'
});

interface PaginationConfig {
  pageSize: number;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
}

type SelectionType = 'checkbox' | 'radio';

const props = defineProps({
  // 外层容器高度固定
  fixedContainerHeight: {
    type: Boolean,
    default: true
  },
  // 查询区布局模式
  queryLayout: {
    type: String,
    default: 'general' // simple
  },
  // 隐藏“选择多少项”文字
  hidePaginationTip: {
    type: Boolean,
    default: false
  },
  // 初始化组件时自动获取数据
  autoFetch: {
    type: Boolean,
    default: false
  },
  // API
  service: {
    type: [Boolean, Function] as PropType<false | Function>,
    default: false
  },
  // 获取请求参数对象的钩子（除了分页参数）
  getQueryData: {
    type: Function as PropType<() => Recordable>,
    default: () => {
      return {};
    }
  },
  // 分页配置
  pagination: {
    type: [Boolean, Object] as PropType<PaginationConfig>,
    default: true
  },
  // 分页参数字段名
  paginationQueryFields: {
    type: Object as PropType<PaginationQueryFieldsOption>
  },
  // 处理请求响应值，返回传给dataSource的数组
  handleTableData: {
    type: Function as PropType<HandleTableDataFunction>
  },
  // 处理请求响应中的数据总数
  handleDataTotal: {
    type: Object as PropType<HandleDataTotalFunction>
  },
  // 开启选择
  selection: {
    type: Boolean,
    default: true
  },
  // 单选/多选
  selectionType: {
    type: String as PropType<SelectionType>,
    default: 'checkbox'
  },
  // 开启全选
  totalSelector: {
    type: Boolean,
    default: false
  },
  // 在反选模式下保留已选择的行（tableData变化后保留之前的选择）
  preserveSelectedRowsInReverseMode: {
    type: Boolean,
    default: false
  },
  // 查询数据对象，有排序或筛选时必填
  queryModel: {
    type: Object as PropType<Recordable>,
    default: () => {
      return null;
    }
  },
  // queryModel对象中排序数据字段key值，默认为sortFields
  sortField: {
    type: String,
    default: 'sortFields'
  },
  // 联合排序
  sortMultiple: {
    type: Boolean,
    default: false
  },
  // 表格列配置（扩展了官方属性）
  columns: {
    type: Array as PropType<ColumnConfig[]>,
    default: () => {
      return [];
    }
  },
  // 表格数据（v-model）
  tableData: {
    type: Array as PropType<Recordable[]>,
    default: () => {
      return [];
    }
  },
  // 表格加载中（v-model）
  tableLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:tableData',
  'update:tableLoading',
  'tableSelect',
  'tableSelectAll'
]);

const { height: windowheight } = useWindowSize();

const tableAreaRef = ref();
const tableHeight = ref(0);

const updateTableHeight = () => {
  nextTick(() => {
    tableHeight.value = tableAreaRef.value.clientHeight - 46; // 减去表头高度
  });
};

watch(windowheight, updateTableHeight);

const getTableStripedRowClassName = (record: Recordable, index: number) =>
  index % 2 === 1 ? 'striped-row' : null;

const {
  tableCols,
  tableData,
  tableLoading,
  fetchTableData,
  resetTableData,
  paginationData,
  selectionFlag,
  selectedRows,
  reverseSelectedRows,
  isRowSelected,
  setSelectedRows,
  defaultTableProps,
  defaultTableEvents,
  reset
} = useBasicTable({
  service: computed(() => props.service),
  getQueryData: props.getQueryData,
  paginationQueryFields: props.paginationQueryFields,
  handleTableData: props.handleTableData,
  handleDataTotal: props.handleDataTotal,
  pagination: props.pagination,
  selection: props.selection,
  selectionType: computed(() => props.selectionType),
  totalSelector: props.totalSelector,
  selectionOnSelect: (...rest: any[]) => {
    emit('tableSelect', ...rest);
  },
  selectionOnSelectAll: (...rest: any[]) => {
    emit('tableSelectAll', ...rest);
  },
  preserveSelectedRowsInReverseMode: props.preserveSelectedRowsInReverseMode,
  columns: computed(() => props.columns),
  queryModel: computed(() => props.queryModel),
  sortField: props.sortField,
  sortMultiple: props.sortMultiple
});

let isInternalUpdate__tableData = false;
watch(
  () => props.tableData,
  (value) => {
    if (isInternalUpdate__tableData) {
      isInternalUpdate__tableData = false;
      return;
    }
    tableData.value = props.tableData;
  },
  {
    immediate: true
  }
);

let isInternalUpdate__tableLoading = false;
watch(
  () => props.tableLoading,
  (value) => {
    if (isInternalUpdate__tableLoading) {
      isInternalUpdate__tableLoading = false;
      return;
    }
    tableLoading.value = props.tableLoading;
  },
  {
    immediate: true
  }
);

watch(tableData, (value) => {
  isInternalUpdate__tableData = true;
  emit('update:tableData', value);
});
watch(tableLoading, (value) => {
  isInternalUpdate__tableLoading = true;
  emit('update:tableLoading', value);
});

onMounted(() => {
  updateTableHeight();
  if (props.autoFetch) {
    fetchTableData();
  }
});

const exposeObj = {
  updateTableHeight,
  tableCols,
  fetchTableData,
  resetTableData,
  selectionFlag,
  selectedRows,
  reverseSelectedRows,
  isRowSelected,
  setSelectedRows,
  reset
};

defineExpose(exposeObj);
</script>

<style lang="less" scoped>
@import '@cqcdi/ms-common-dev/src/design/theme/default/global.less';

.common-list {
  width: 100%;

  .query-area {
    width: 100%;
    padding-bottom: 6px;
    &.border {
      border-bottom: 1px solid #dddddd;
    }
  }

  .top-action-wrapper {
    width: 100%;
    padding: 18px 0px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .top-action-area {
      width: 0px;
      flex: 1;
    }
    .simple-query-area {
      flex: none;
      :deep {
        .table-query-form.inline {
          .ant-form-item {
            margin-bottom: 0px;
          }
        }
      }
    }
  }

  .table-area {
    width: 100%;
    :deep {
      .ant-table-wrapper {
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
                }
                .ant-table-body {
                  height: 0px;
                  flex: 1;
                }
              }
            }
          }
        }
      }
    }
  }

  .bottom-action-area {
    width: 100%;
    height: 46px;
    display: flex;
    align-items: center;
    padding: 0px 16px;
    background-color: #fafafa;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    .basic-table-pagination {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .tip {
        color: #9ca1b5;
        i {
          color: @primary-color;
        }
      }
      :deep {
        .ant-pagination-options {
          .ant-select {
            min-width: 97px;
          }
        }
      }
    }
  }

  &.fixed-container-height {
    height: 100%;
    display: flex;
    flex-direction: column;

    .query-area {
      flex: none;
    }

    .top-action-wrapper {
      flex: none;
    }

    .table-area {
      height: 0px;
      flex: 1;
    }

    .bottom-action-area {
      flex: none;
    }
  }
}
</style>

<style lang="less">
.inner-ant-table-striped {
  .striped-row {
    td {
      background-color: #f6f6f6;
    }
  }
}
</style>
