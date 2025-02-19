<template>
  <div class="basic-table">
    <div
      v-if="$slots.query && queryLayout === 'general'"
      class="query-area"
      :class="{ border: $slots.topAction }"
    >
      <slot name="query"></slot>
    </div>
    <div
      v-if="$slots.topAction || ($slots.query && queryLayout === 'simple')"
      class="top-action-wrapper"
      :style="{ paddingTop: !($slots.query && queryLayout === 'general') ? '0px' : undefined }"
    >
      <div class="top-action-area">
        <slot name="topAction"></slot>
      </div>
      <div class="simple-query-area" v-if="queryLayout === 'simple'">
        <slot name="query"></slot>
      </div>
    </div>
    <div class="table-area inner-ant-table-striped" ref="tableAreaRef">
      <slot name="table" :tableHeight="tableHeight" :stripedRowClassName="tableStripedRowClassName">
      </slot>
    </div>
    <div class="bottom-action-area" v-if="paginationData">
      <slot name="bottomAction">
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
            @change="fetchTableData"
            @showSizeChange="fetchTableData"
          />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination } from 'ant-design-vue/es';
import { useWindowSize } from '@vueuse/core';
import { nextTick, onMounted, PropType, ref, watch } from 'vue';

const props = defineProps({
  paginationData: {
    type: Object as PropType<Recordable>,
    default() {
      return null;
    }
  },
  selectedRows: {
    type: Object as PropType<Recordable[]>,
    default() {
      return null;
    }
  },
  selectionFlag: {
    type: String,
    default: 'general' // reverse
  },
  reverseSelectedRows: {
    type: Object as PropType<Recordable[]>,
    default() {
      return null;
    }
  },
  hidePaginationTip: {
    type: Boolean,
    default: false
  },
  queryLayout: {
    type: String,
    default: 'general' // simple
  }
});

const emit = defineEmits(['fetchTableData', 'getTableData']);

const { height: windowheight } = useWindowSize();

const tableAreaRef = ref();
const tableHeight = ref(0);

const updateTableHeight = () => {
  nextTick(() => {
    tableHeight.value = tableAreaRef.value.clientHeight - 46; // 减去表头高度
  });
};

onMounted(() => {
  updateTableHeight();
});

watch(windowheight, updateTableHeight);

const tableStripedRowClassName = (record: Recordable, index: number) =>
  index % 2 === 1 ? 'striped-row' : null;

const fetchTableData = () => {
  emit('fetchTableData');
  emit('getTableData'); // 历史遗留
};

defineExpose({ updateTableHeight });
</script>

<style lang="less" scoped>
.basic-table {
  height: 100%;
  display: flex;
  flex-direction: column;

  .query-area {
    width: 100%;
    flex: none;
    padding-bottom: 6px;
    &.border {
      border-bottom: 1px solid #dddddd;
    }
  }

  .top-action-wrapper {
    width: 100%;
    flex: none;
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
    height: 0px;
    flex: 1;
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
    flex: none;
    display: flex;
    align-items: center;
    padding: 0px 16px;
    background-color: #fafafa;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    .basic-table-pagination {
      :deep {
        .ant-pagination-options {
          .ant-select {
            min-width: 97px;
          }
        }
      }
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
