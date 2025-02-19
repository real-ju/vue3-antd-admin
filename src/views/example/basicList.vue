<template>
  <div class="xxx-page basic-page">
    <TBLayout>
      <template #top>
        <div class="basic-page-card no-padding">xxx</div>
      </template>
      <template #bottom>
        <div class="basic-page-card">
          <BasicTable ref="basicTableRef" v-bind="basicTableProps" v-on="basicTableEvents">
            <template #query>
              <TableQueryForm
                ref="tableQueryFormRef"
                :config="queryFormConfig"
                v-model:model="queryFormModel"
                :label-fix-width="false"
                :basicTableRef="basicTableRef"
                v-bind="queryFormProps"
                v-on="queryFormEvents"
              >
              </TableQueryForm>
            </template>
            <template #topAction>
              <div class="basic-table-action">
                <a-button type="primary" @click="add">
                  <Icon name="plus"></Icon>
                  新增
                </a-button>
                <a-divider type="vertical" />
                <a-button type="primary" ghost @click="openExampleModal()">
                  <Icon type="ant" name="ExperimentOutlined"></Icon>
                  exampleModal
                </a-button>
                <a-button type="primary" ghost @click="simple()">
                  <Icon type="ant" name="ExperimentOutlined"></Icon>
                  simpleModal
                </a-button>
              </div>
            </template>
            <template #table="{ tableHeight }">
              <a-table v-bind="tableProps" v-on="tableEvents" :scroll="{ x: 1200, y: tableHeight }">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'xxx'">
                    {{ record.xxx }}
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <TableOperateGroup>
                      <TableOperateButton @click="edit(record)">编辑</TableOperateButton>
                    </TableOperateGroup>
                  </template>
                </template>
              </a-table>
            </template>
          </BasicTable>
        </div>
      </template>
    </TBLayout>
  </div>
  <UpdateModal v-bind="updateModalProps" v-on="updateModalEvents"></UpdateModal>
  <ExampleModal v-bind="exampleModalProps" v-on="exampleModalEvents"></ExampleModal>
  <SimpleModal v-bind="simpleModalProps" v-on="simpleModalEvents">
    <p>确定执行操作？</p>
  </SimpleModal>
</template>

<script setup lang="ts">
import { TBLayout } from '/@/components';
import UpdateModal from './updateModal.vue';
import ExampleModal from './exampleModal.vue';
import { useBasicTable } from '/@/hooks/component/useBasicTable';
import { useBasicModalOuter } from '/@/hooks/component/useBasicModalOuter';
import { useSimpleModal } from '/@/hooks/component/useSimpleModal';
// import { message } from 'ant-design-vue/es';

// 查询
const tableQueryFormRef = ref();
const queryFormConfig = ref([
  {
    name: 'xxx',
    type: 'input',
    props: {
      placeholder: 'xxx'
    }
  }
]);
const queryFormModel = ref({
  xxx: ''
});

// 操作
const { updateModalProps, updateModalEvents, openUpdateModal } = useBasicModalOuter({
  mode: 'recordUpdate',
  name: 'update'
});
const add = () => {
  openUpdateModal('add');
};
const edit = (record: Recordable) => {
  openUpdateModal('edit', record);
};

const { exampleModalProps, exampleModalEvents, openExampleModal } = useBasicModalOuter({
  mode: 'general',
  name: 'example'
});

const { simpleModalProps, simpleModalEvents, simpleModalVisible, simpleModalLoading } =
  useSimpleModal({
    name: 'simple',
    title: '简单对话框',
    danger: true,
    onModalConfirm: () => {}
  });
const simple = () => {
  console.log('simpleModalVisible', simpleModalVisible);
  simpleModalVisible.value = true;
};

// 列表
const getQueryData = () => {
  const data: Recordable = {};
  return data;
};
const basicTableRef = ref();
const {
  basicTableProps,
  basicTableEvents,
  queryFormProps,
  queryFormEvents,
  tableProps,
  tableEvents,
  tableCols,
  tableData,
  tableLoading,
  paginationData,
  fetchTableData,
  resetTableData,
  selectedRows
} = useBasicTable({
  service: false,
  getQueryData,
  handleTableData(res: any) {
    const list = res.data.records;
    return list.map((item: Recordable) => {
      return {
        id: item.id,
        xxx: item.xxx
      };
    });
  },
  pagination: {
    pageSize: 10
  },
  columns: [
    {
      title: 'field1',
      key: 'field1',
      dataIndex: 'field1',
      popover: true
    },
    {
      title: 'field2',
      key: 'field2',
      dataIndex: 'field2'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right'
    }
  ]
});

// 使用时删除
tableData.value = [
  {
    id: '1',
    field1:
      '测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字',
    field2:
      '测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字'
  }
];
</script>

<style lang="less" scoped>
.xxx-page {
  height: 100%;
}
</style>
