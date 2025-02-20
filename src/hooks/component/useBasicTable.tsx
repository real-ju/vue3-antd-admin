import type { Ref } from 'vue';
import type { TableColumnType } from 'ant-design-vue/es';
import type { Dict } from '/@/logics/dict';

import BasicPopover from '/@/components/BasicPopover/index.vue';

export type ColumnConfig = TableColumnType & {
  key: string;
  popover?: true | Recordable;
  sort?: boolean; // 开启排序
  sortField?: string; // 排序数据（接口）中的字段标识，不传默认取列的key
  filterDict?: Dict | Ref<Dict>; // 通过字典生成filters
  filterField?: string; // 筛选值绑定的queryModel字段，不传默认取列的key
};

interface PaginationConfig {
  pageSize: number;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
}

interface HandleTableDataFunction {
  (res: any): Recordable[];
}

interface HandleDataTotalFunction {
  (res: any): number;
}

interface PaginationQueryFieldsOption {
  page: string;
  pageSize: string;
}

type SelectionType = 'checkbox' | 'radio';

export interface BasicTableConfig {
  service: false | Function | Ref<Function | false>; // /@/api导出的函数
  getQueryData?: () => Recordable;
  paginationQueryFields?: PaginationQueryFieldsOption;
  handleTableData?: HandleTableDataFunction;
  handleDataTotal?: HandleDataTotalFunction;
  pagination: false | PaginationConfig;
  selectionType?: SelectionType | Ref<SelectionType>;
  totalSelector?: boolean;
  selectionOnSelect?: Function; // 单选后
  selectionOnSelectAll?: Function; // 多选后
  preserveSelectedRowsInReverseMode?: boolean; // 在反选模式下保留已选择的行（tableData变化后保留之前的选择）
  columns?: ColumnConfig[] | Ref<ColumnConfig[]>;
  queryModel?: Ref<Recordable>; // 查询数据对象，有排序或筛选时必填
  sortField?: string; // queryModel对象中排序数据字段key值，默认为sortFields
  sortMultiple?: boolean; // 联合排序
  queryLayout?: 'general' | 'simple';
}

export const useBasicTable = (config: BasicTableConfig) => {
  if (!config.handleTableData) {
    config.handleTableData = (res: any) => {
      return res.data?.records || [];
    };
  }

  if (!config.handleDataTotal) {
    config.handleDataTotal = (res: any) => {
      return res.data?.total || 0;
    };
  }

  const tableData = ref<Recordable[]>([]);
  const tableLoading = ref(false);

  const paginationData = reactive({
    total: 0,
    page: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '50', '100', '500'],
    showSizeChanger: true
  });

  if (config.pagination) {
    paginationData.pageSize = config.pagination.pageSize;
    if (Reflect.has(config.pagination, 'pageSizeOptions')) {
      paginationData.pageSizeOptions = config.pagination.pageSizeOptions!;
    }
    if (Reflect.has(config.pagination, 'showSizeChanger')) {
      paginationData.showSizeChanger = config.pagination.showSizeChanger!;
    }
  }

  const fetchTableData = (queryData?: Recordable) => {
    if (!queryData) {
      queryData = config.getQueryData?.() || {};
    }
    let service = config.service;
    if (isRef(service)) {
      service = service.value;
    }
    if (service === false) {
      return;
    }

    tableLoading.value = true;
    let reqParams: Recordable = {
      ...queryData
    };
    if (config.pagination) {
      const paginationQueryFields = config.paginationQueryFields || {
        page: 'page',
        pageSize: 'size'
      };
      reqParams[paginationQueryFields.page] = paginationData.page;
      reqParams[paginationQueryFields.pageSize] = paginationData.pageSize;
    }
    return service(reqParams)
      .then((res: any) => {
        tableData.value = config.handleTableData!(res);
        if (config.pagination) {
          paginationData.total = config.handleDataTotal!(res);
        }
      })
      .finally(() => {
        tableLoading.value = false;
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
    const selectionType = unref(config.selectionType) || 'checkbox';
    if (selectionType === 'checkbox' && config.totalSelector) {
      if (selectionFlag.value === 'reverse') {
        const newSelectedRows = tableData.value.filter(
          (item) => !reverseSelectedRowKeys.value.includes(item.id)
        );
        if (config.preserveSelectedRowsInReverseMode) {
          const addRows = newSelectedRows.filter(
            (item) => !selectedRowKeys.value.includes(item.id)
          );
          selectedRows.value.push(...addRows);
        } else {
          selectedRows.value = newSelectedRows;
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
    const selectionType = unref(config.selectionType) || 'checkbox';
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
            config.selectionOnSelect?.(record, selected);
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
          config.selectionOnSelectAll?.(selected, _selectedRows, changeRows);
        }
      };
      tableRowSelection.value = {
        ...defaultTableRowSelection,
        ...extraRowSelection
      };
      if (config.totalSelector) {
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
                const changeRows = tableData.value.filter(
                  (item) => !selectedRowKeys.value.includes(item.id)
                );
                selectedRows.value = [...tableData.value];
                reverseSelectedRows.value = [];
                config.selectionOnSelectAll?.(true, [], changeRows);
              }
            },
            {
              key: 'clearTotal',
              text: '清空所有',
              onSelect: (changableRowKeys: string[]) => {
                selectionFlag.value = 'general';
                const changeRows = tableData.value.filter((item) =>
                  selectedRowKeys.value.includes(item.id)
                );
                selectedRows.value = [];
                reverseSelectedRows.value = [];
                config.selectionOnSelectAll?.(false, [], changeRows);
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
  initTableRowSelection();

  watch(tableData, onTableDataChange);

  // 监听config.selectionType变化
  if (isRef(config.selectionType)) {
    watch(config.selectionType, () => {
      // 清空选择状态
      selectionFlag.value = 'general';
      selectedRows.value = [];
      reverseSelectedRows.value = [];
      initTableRowSelection();
    });
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
    if (config.totalSelector) {
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
    let columns = config.columns;
    if (!columns) {
      return [];
    }
    columns = unref(columns);
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
            return <BasicPopover title={item.title} value={text} {...popover}></BasicPopover>;
          } else {
            return text;
          }
        }
      };
      if (item.sort) {
        newItem.sorter = true;
        newItem.sortOrder = computed(() => {
          const queryModel = config.queryModel;
          if (!queryModel) {
            return null;
          }
          const sortField = config.sortField || 'sortFields';
          if (config.sortMultiple) {
            return null;
          } else {
            const sortOrderMap: Recordable = {
              ASC: 'ascend',
              DESC: 'descend'
            };
            return item.key === sortColumnKey.value
              ? sortOrderMap[queryModel.value[sortField]?.[0]?.sortOrder] || null
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
          const queryModel = config.queryModel;
          if (!queryModel) {
            return null;
          }
          const modelValue = queryModel.value[item.filterField || item.key];
          return modelValue || [];
        });
      }
      return newItem;
    });
  };

  const initTableCols = () => {
    if (!config.columns) {
      return ref([]);
    }
    return ref(computeColumns());
  };

  const tableCols: Ref<ColumnConfig[]> = initTableCols();
  if (config.columns && isRef(config.columns)) {
    watch(config.columns, () => {
      tableCols.value = computeColumns();
    });
  }

  // @resizeColumn开启列表可伸缩列
  const onTableResizeColumn = (w: number, col: Recordable) => {
    col.width = w;
  };

  // 开启排序或筛选后使用
  const onTableChange = (pagination: any, filters: Recordable, sorter: any) => {
    const triggerSort = sorter && sorter.columnKey;
    if (triggerSort) {
      // 触发排序
      if (config.sortMultiple) {
      } else {
        sortColumnKey.value = sorter.columnKey;
        if (config.queryModel) {
          const sortField = config.sortField || 'sortFields';
          const sortOrderMap: Recordable = {
            ascend: 'ASC',
            descend: 'DESC'
          };
          config.queryModel.value[sortField] = sorter.order
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
        if (column && config.queryModel) {
          config.queryModel.value[column.filterField || column.key] = item || [];
        }
      }
    }
    if (triggerSort || triggerFilter) {
      resetTableData();
    }
  };

  const tableProps = reactive({
    columns: tableCols,
    dataSource: tableData,
    pagination: false,
    loading: tableLoading,
    rowKey: 'id',
    rowSelection: tableRowSelection,
    showSorterTooltip: false
  });

  const tableEvents = {
    resizeColumn: onTableResizeColumn,
    change: onTableChange
  };

  const basicTableProps = reactive({
    paginationData: paginationData,
    selectedRows: selectedRows,
    queryLayout: config.queryLayout || 'general'
  });

  const basicTableEvents = {
    fetchTableData: fetchTableData
  };

  const queryFormProps = reactive({
    selectedRows: selectedRows
  });

  const onUpdateSelectedRows = (rows: Recordable[]) => {
    selectedRows.value = rows;
  };
  const queryFormEvents = {
    'update:selectedRows': onUpdateSelectedRows,
    resetTableData: resetTableData
  };

  return {
    tableCols,
    tableData,
    tableLoading,
    fetchTableData,
    resetTableData,
    paginationData,
    selectionFlag,
    selectedRows,
    reverseSelectedRows,
    tableRowSelection,
    isRowSelected,
    setSelectedRows,
    onTableResizeColumn,
    onTableChange,
    tableProps,
    tableEvents,
    basicTableProps,
    basicTableEvents,
    queryFormProps,
    queryFormEvents
  };
};
