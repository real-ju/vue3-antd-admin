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
} from './types';
import type { Nullable, Recordable } from '@cqcdi/core-types';
import type { PropType } from 'vue';

import { Pagination } from 'ant-design-vue/es';
import { useWindowSize } from '@vueuse/core';
import { computed, nextTick, onMounted, reactive, ref, unref, watch } from 'vue';
import { WrapPopover } from '@cqcdi/core-ui-antd';
import { getDefaultConfig } from './index';

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
  // API
  service: {
    type: [Boolean, Function],
    default: false
  },
  // 获取请求参数对象的钩子（除了分页参数）
  getQueryData: {
    type: Function,
    default: () => {
      return {};
    }
  },
  // 分页配置
  pagination: {
    type: [Boolean, Object], // 类型：boolean | PaginationConfig
    default: true
  },
  // 分页参数字段名
  paginationQueryFields: {
    type: Object as PropType<PaginationQueryFieldsOption>,
    default: () => {
      const defaultConfig = getDefaultConfig();
      return (
        defaultConfig.paginationQueryFields || {
          page: 'page',
          pageSize: 'size'
        }
      );
    }
  },
  // 处理请求响应值，返回传给dataSource的数组
  handleTableData: {
    type: Object as PropType<HandleTableDataFunction>,
    default: (res: any) => {
      const defaultConfig = getDefaultConfig();
      if (defaultConfig.handleTableData) {
        return defaultConfig.handleTableData(res);
      } else {
        return res.data?.records || [];
      }
    }
  },
  // 处理请求响应中的数据总数
  handleDataTotal: {
    type: Object as PropType<HandleDataTotalFunction>,
    default: (res: any) => {
      const defaultConfig = getDefaultConfig();
      if (defaultConfig.handleDataTotal) {
        return defaultConfig.handleDataTotal(res);
      } else {
        return res.data?.total || 0;
      }
    }
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
  },
  // 隐藏“选择多少项”文字
  hidePaginationTip: {
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

const paginationData = reactive({
  total: 0,
  page: 1,
  pageSize: 10,
  pageSizeOptions: ['10', '50', '100', '500'],
  showSizeChanger: true
});

if (props.pagination) {
  const pagination = props.pagination === true ? {} : props.pagination;
  if (Reflect.has(pagination, 'pageSize')) {
    paginationData.pageSize = pagination.pageSize!;
  }
  if (Reflect.has(pagination, 'pageSizeOptions')) {
    paginationData.pageSizeOptions = pagination.pageSizeOptions!;
  }
  if (Reflect.has(pagination, 'showSizeChanger')) {
    paginationData.showSizeChanger = pagination.showSizeChanger!;
  }
}

const fetchTableData = (queryData?: Recordable) => {
  if (!queryData) {
    queryData = props.getQueryData();
  }
  let service = props.service;
  if (service === false) {
    return;
  }

  emit('update:tableLoading', true);
  let reqParams: Recordable = {
    ...queryData
  };
  if (props.pagination) {
    const paginationQueryFields = props.paginationQueryFields;
    reqParams[paginationQueryFields.page] = paginationData.page;
    reqParams[paginationQueryFields.pageSize] = paginationData.pageSize;
  }
  return (service as Function)(reqParams)
    .then((res: any) => {
      emit('update:tableData', props.handleTableData!(res));
      if (props.pagination) {
        paginationData.total = props.handleDataTotal!(res);
      }
    })
    .finally(() => {
      emit('update:tableLoading', false);
    });
};

const resetTableData = async (queryData?: Recordable) => {
  paginationData.page = 1;
  await fetchTableData(queryData);
};

const selectionFlag = ref('general'); // 选择标志位：general-正选 reverse-反选
const selectedRows = ref<Recordable[]>([]);
const selectedRowKeys = computed(() => {
  return selectedRows.value?.map((item) => item.id);
});
const reverseSelectedRows = ref<Recordable[]>([]);
const reverseSelectedRowKeys = computed(() => {
  return reverseSelectedRows.value?.map((item) => item.id);
});

const onTableDataChange = () => {
  // 处理选择逻辑
  if (props.selection !== false) {
    const selectionType = props.selectionType;
    if (selectionType === 'checkbox' && props.totalSelector) {
      if (selectionFlag.value === 'reverse') {
        const newSelectedRows = props.tableData.filter(
          (item) => !reverseSelectedRowKeys.value.includes(item.id)
        );
        if (props.preserveSelectedRowsInReverseMode) {
          const addRows = newSelectedRows.filter(
            (item) => !selectedRowKeys.value.includes(item.id)
          );
          selectedRows.value.push(...addRows);
        } else {
          selectedRows.value = newSelectedRows;
        }
      }
    }
  }
};

const defaultTableRowSelection = {
  selectedRowKeys: selectedRowKeys,
  fixed: true
};

const tableRowSelection = ref<Recordable>();

const initTableRowSelection = () => {
  const selectionType = props.selectionType;
  if (selectionType === 'checkbox') {
    const extraRowSelection = {
      type: selectionType,
      onSelect: (record: Recordable, selected: boolean, callHook = true) => {
        if (selected) {
          if (!selectedRowKeys.value.includes(record.id)) {
            selectedRows.value.push(record);
          }
          if (selectionFlag.value === 'reverse') {
            const index = reverseSelectedRows.value.findIndex((item) => item.id === record.id);
            if (index !== -1) {
              reverseSelectedRows.value.splice(index, 1);
            }
          }
        } else {
          const index = selectedRows.value.findIndex((item) => item.id === record.id);
          if (index !== -1) {
            reverseSelectedRows.value.push(selectedRows.value[index]);
            selectedRows.value.splice(index, 1);
          }
        }
        if (callHook) {
          emit('tableSelect', record, selected);
        }
      },
      onSelectAll: (selected: boolean, _selectedRows: Recordable[], changeRows: Recordable[]) => {
        if (selected) {
          selectedRows.value.push(...changeRows);
          if (selectionFlag.value === 'reverse') {
            const addKeys = changeRows.map((item) => item.id);
            reverseSelectedRows.value = reverseSelectedRows.value.filter((item) => {
              return !addKeys.includes(item.id);
            });
          }
        } else {
          const deleteKeys = changeRows.map((item) => item.id);
          const newRows = selectedRows.value.filter((item) => {
            return !deleteKeys.includes(item.id);
          });
          selectedRows.value = newRows;
          if (selectionFlag.value === 'reverse') {
            reverseSelectedRows.value.push(...changeRows);
          }
        }
        emit('tableSelectAll', selected, _selectedRows, changeRows);
      }
    };
    tableRowSelection.value = {
      ...defaultTableRowSelection,
      ...extraRowSelection
    };
    if (props.totalSelector) {
      tableRowSelection.value = {
        ...defaultTableRowSelection,
        ...extraRowSelection,
        hideDefaultSelections: true,
        selections: [
          {
            key: 'selectTotal',
            text: '全选所有',
            onSelect: (changableRowKeys: string[]) => {
              selectionFlag.value = 'reverse';
              const changeRows = props.tableData.filter(
                (item) => !selectedRowKeys.value.includes(item.id)
              );
              selectedRows.value = [...props.tableData];
              reverseSelectedRows.value = [];
              emit('tableSelectAll', true, [], changeRows);
            }
          },
          {
            key: 'clearTotal',
            text: '清空所有',
            onSelect: (changableRowKeys: string[]) => {
              selectionFlag.value = 'general';
              const changeRows = props.tableData.filter((item) =>
                selectedRowKeys.value.includes(item.id)
              );
              selectedRows.value = [];
              reverseSelectedRows.value = [];
              emit('tableSelectAll', false, [], changeRows);
            }
          }
        ]
      };
    }
  } else {
    tableRowSelection.value = {
      ...defaultTableRowSelection,
      type: selectionType,
      onChange: (_selectedRowKeys: string[], _selectedRows: Recordable[]) => {
        selectedRows.value = _selectedRows;
      }
    };
  }
};
if (props.selection !== false) {
  initTableRowSelection();
}

watch(() => props.tableData, onTableDataChange);

// 监听config.selectionType变化
if (props.selection !== false) {
  watch(
    () => props.selectionType,
    () => {
      // 清空选择状态
      selectionFlag.value = 'general';
      selectedRows.value = [];
      reverseSelectedRows.value = [];
      initTableRowSelection();
    }
  );
}

// 判断行是否选中
const isRowSelected = (row: Recordable) => {
  if (selectionFlag.value === 'general') {
    return selectedRowKeys.value.includes(row.id);
  } else {
    return !reverseSelectedRowKeys.value.includes(row.id);
  }
};

// 设置选择的行
const setSelectedRows = (flag: 'general' | 'reverse' = 'general', rows: Recordable[]) => {
  if (props.totalSelector) {
    if (flag === 'general') {
      selectionFlag.value = 'general';
      selectedRows.value = [...rows];
      reverseSelectedRows.value = [];
    } else {
      selectionFlag.value = 'reverse';
      reverseSelectedRows.value = [...rows];
      onTableDataChange();
    }
  } else {
    if (flag === 'general') {
      selectedRows.value = [...rows];
    }
  }
};

// 单个排序时-当前排序的列标识
const sortColumnKey = ref<Nullable<string>>(null);

// 计算列表列配置
const computeColumns = () => {
  const columns = props.columns;
  return columns.map((item) => {
    const newItem: Recordable = {
      ...item,
      ellipsis: true,
      resizable: !item.fixed,
      customRender: ({ text, record, index, column }: any) => {
        let popover = item.popover;
        if (popover) {
          if (popover === true) {
            popover = {};
          }
          text = String(text);
          return <WrapPopover title={item.title} data={text} {...popover}></WrapPopover>;
        } else {
          return text;
        }
      }
    };
    if (item.sort) {
      newItem.sorter = props.sortMultiple ? { multiple: 1 } : true;
      console.log('props.queryModel', props.queryModel);
      newItem.sortOrder = computed(() => {
        const queryModel = props.queryModel;
        if (!queryModel) {
          return null;
        }
        const sortField = props.sortField || 'sortFields';
        const sortOrderMap: Recordable = {
          ASC: 'ascend',
          DESC: 'descend'
        };
        if (props.sortMultiple) {
          const sortData = queryModel[sortField];
          if (sortData) {
            const sortDataItem = sortData.find((sortItem: Recordable) => {
              return sortItem.fieldName === (item.sortField || item.key);
            });
            return sortOrderMap[sortDataItem?.sortOrder] || null;
          } else {
            return null;
          }
        } else {
          return item.key === sortColumnKey.value
            ? sortOrderMap[queryModel[sortField]?.[0]?.sortOrder] || null
            : null;
        }
      });
    }
    const filterDict = unref(item.filterDict);
    if (filterDict || item.filters || item.customFilterDropdown) {
      // 开启筛选
      if (filterDict) {
        newItem.filters = computed(() => {
          const dict = unref(item.filterDict);
          return dict?.map((item) => {
            return {
              text: item.name,
              value: item.value
            };
          });
        });
      }
      newItem.filteredValue = computed(() => {
        const queryModel = props.queryModel;
        if (!queryModel) {
          return null;
        }
        const modelValue = queryModel[item.filterField || item.key];
        return modelValue || [];
      });
    }
    return newItem;
  });
};

const tableCols = ref<ColumnConfig[]>(computeColumns());
if (props.columns) {
  watch(
    () => props.columns,
    () => {
      tableCols.value = computeColumns();
    }
  );
}

// @resizeColumn开启列表可伸缩列
const onTableResizeColumn = (w: number, col: Recordable) => {
  col.width = w;
};

// 开启排序或筛选后使用
const onTableChange = (pagination: any, filters: Recordable, sorter: any) => {
  const triggerSort = Array.isArray(sorter) || (sorter && sorter.columnKey);
  if (triggerSort) {
    // 触发排序
    const sortField = props.sortField || 'sortFields';
    const sortOrderMap: Recordable = {
      ascend: 'ASC',
      descend: 'DESC'
    };
    if (props.sortMultiple) {
      sorter = [].concat(sorter).filter((item: Recordable) => !!item.order);
      if (props.queryModel) {
        props.queryModel[sortField] = sorter.map((item: Recordable) => {
          return {
            fieldName: item.column.sortField || item.columnKey,
            sortOrder: sortOrderMap[item.order] || null
          };
        });
      }
    } else {
      sortColumnKey.value = sorter.columnKey;
      if (props.queryModel) {
        props.queryModel[sortField] = sorter.order
          ? [
              {
                fieldName: sorter.column.sortField || sorter.columnKey,
                sortOrder: sortOrderMap[sorter.order] || null
              }
            ]
          : [];
      }
    }
  }
  let triggerFilter = false;
  for (const key in filters) {
    if (Object.prototype.hasOwnProperty.call(filters, key)) {
      triggerFilter = true;
      const item = filters[key];
      const column = tableCols.value.find((col: Recordable) => {
        return col.key === key;
      });
      if (column && props.queryModel) {
        props.queryModel[column.filterField || column.key] = item || [];
      }
    }
  }
  if (triggerSort || triggerFilter) {
    resetTableData();
  }
};

const defaultTableProps = reactive({
  columns: tableCols,
  dataSource: computed(() => props.tableData),
  pagination: false,
  loading: computed(() => props.tableLoading),
  rowKey: 'id',
  rowSelection: tableRowSelection,
  showSorterTooltip: false
});

const defaultTableEvents = {
  resizeColumn: onTableResizeColumn,
  change: onTableChange
};

const reset = () => {
  selectionFlag.value = 'general';
  selectedRows.value = [];
  reverseSelectedRows.value = [];
  resetTableData();
};

onMounted(() => {
  updateTableHeight();
});

const exposeObj = {
  updateTableHeight,
  tableCols,
  fetchTableData,
  resetTableData,
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
