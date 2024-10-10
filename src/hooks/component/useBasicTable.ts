import { isRef } from 'vue';

interface PaginationConfig {
  pageSize: number;
  pageSizeOptions?: string[];
}

interface HandleTableDataFunction {
  (res: any): Recordable[];
}

interface HandleDataTotalFunction {
  (res: any): number;
}

export interface BasicTableConfig {
  service: false | Function | Ref<Function>; // /@/api导出的函数
  handleTableData?: HandleTableDataFunction;
  handleDataTotal?: HandleDataTotalFunction;
  pagination: false | PaginationConfig;
  selectionType?: 'checkbox' | 'radio';
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
    pageSizeOptions: ['10', '20', '30', '40']
  });

  if (config.pagination) {
    paginationData.pageSize = config.pagination.pageSize;
    if (config.pagination.pageSizeOptions) {
      paginationData.pageSizeOptions = config.pagination.pageSizeOptions;
    }
  }

  const fetchTableData = (queryData: Recordable = {}) => {
    let service = config.service;
    if (service === false) {
      return;
    }
    if (isRef(service)) {
      service = service.value;
    }

    tableLoading.value = true;
    let reqParams: Recordable = {
      ...queryData
    };
    if (config.pagination) {
      reqParams.page = paginationData.page;
      reqParams.size = paginationData.pageSize;
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

  const selectedRows = ref<Recordable[]>([]);
  const selectedRowKeys = computed(() => {
    return selectedRows.value?.map((item) => item.id);
  });

  let tableRowSelection: Recordable = {
    selectedRowKeys
  };
  const selectionType = config.selectionType || 'checkbox';
  if (selectionType === 'checkbox') {
    tableRowSelection = {
      ...tableRowSelection,
      onSelect: (record: Recordable, selected: boolean) => {
        if (selected) {
          selectedRows.value.push(record);
        } else {
          const index = selectedRows.value.findIndex((item) => item.id === record.id);
          if (index !== -1) {
            selectedRows.value.splice(index, 1);
          }
        }
      },
      onSelectAll: (selected: boolean, _selectedRows: Recordable[], changeRows: Recordable[]) => {
        if (selected) {
          selectedRows.value.push(...changeRows);
        } else {
          const deleteKeys = changeRows.map((item) => item.id);
          const newRows = selectedRows.value.filter((item) => {
            return !deleteKeys.includes(item.id);
          });
          selectedRows.value = newRows;
        }
      }
    };
  } else {
    tableRowSelection = {
      ...tableRowSelection,
      onChange: (_selectedRowKeys: string[], _selectedRows: Recordable[]) => {
        selectedRows.value = _selectedRows;
      }
    };
  }

  return {
    tableData,
    tableLoading,
    fetchTableData,
    paginationData,
    selectedRows,
    tableRowSelection
  };
};
