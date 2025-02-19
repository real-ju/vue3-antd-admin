<template>
  <Modal
    class="basic-modal"
    v-bind="props.modalProps"
    :title="status ? undefined : props.modalProps.title"
    :visible="visible"
    @update:visible="onUpdateVisible"
  >
    <template v-if="loadingTipHeight">
      <div
        class="modal-content"
        :class="{ scroll: scrollY, 'no-padding': contentNoPadding }"
        :style="{ maxHeight: scrollY ? `${scrollY}px` : undefined }"
        v-if="!modalLoading"
      >
        <slot></slot>
      </div>
      <LoadingTipBox v-else bgColor="transparent" :height="loadingTipHeight" />
    </template>
    <div
      v-else
      class="modal-content"
      :class="{ scroll: scrollY, 'no-padding': contentNoPadding }"
      :style="{ maxHeight: scrollY ? `${scrollY}px` : undefined }"
    >
      <slot></slot>
      <LoadingTipBox v-if="modalLoading" height="100%" float />
    </div>
    <template #title v-if="status">
      <div class="custom-title">
        <Icon
          v-if="status === 'success'"
          class="status-icon success"
          type="ant"
          name="CheckCircleOutlined"
        >
        </Icon>
        <Icon
          v-else-if="status === 'error'"
          class="status-icon error"
          type="ant"
          name="CloseCircleOutlined"
        >
        </Icon>
        <span>{{ modalProps.title || '' }}</span>
      </div>
    </template>
    <template #footer>
      <slot name="footer">
        <Button @click="onModalCancel">取消</Button>
        <Button
          type="primary"
          :disabled="modalLoading"
          :loading="confirmBtnLoading"
          v-bind="confirmBtnProps"
          @click="onModalConfirm"
        >
          确定
        </Button>
      </slot>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { Modal, Button } from 'ant-design-vue/es';
import LoadingTipBox from '../LoadingTipBox/index.vue';
import Icon from '../Icon';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  modalProps: {
    type: Object,
    default() {
      return {};
    }
  },
  modalLoading: {
    type: Boolean,
    default: false
  },
  // 加载提示的高度
  loadingTipHeight: {
    type: String,
    default: ''
  },
  confirmBtnLoading: {
    type: Boolean,
    default: false
  },
  confirmBtnProps: {
    type: Object,
    default() {
      return {};
    }
  },
  scrollY: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    default: ''
  },
  contentNoPadding: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'modalConfirm']);

const onUpdateVisible = (visible: boolean) => {
  emit('update:visible', visible);
};

const closeModal = () => {
  emit('update:visible', false);
};

const onModalCancel = () => {
  closeModal();
};

const onModalConfirm = () => {
  emit('modalConfirm');
};
</script>

<style lang="less" scoped>
@import '../../design/theme/default/global.less';

.modal-content {
  width: 100%;
  padding: 24px;
  padding-bottom: 0px;
  position: relative;
  &.scroll {
    overflow-y: auto;
  }
  &.no-padding {
    padding: 0px;
  }
}
.custom-title {
  display: flex;
  align-items: center;
  .status-icon {
    font-size: 20px;
    margin-right: 10px;
    &.success {
      color: @success-color;
    }
    &.error {
      color: @error-color;
    }
  }
}
</style>
