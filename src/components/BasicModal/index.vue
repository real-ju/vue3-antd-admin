<template>
  <a-modal
    class="basic-modal"
    v-bind="props.modalProps"
    :visible="visible"
    @update:visible="onUpdateVisible"
  >
    <template v-if="loadingTipHeight">
      <div
        class="modal-content"
        :class="{ scroll: scrollY }"
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
      :class="{ scroll: scrollY }"
      :style="{ maxHeight: scrollY ? `${scrollY}px` : undefined }"
    >
      <slot></slot>
      <LoadingTipBox v-if="modalLoading" height="100%" float />
    </div>
    <template #footer>
      <slot name="footer">
        <a-button @click="onModalCancel">取消</a-button>
        <a-button
          type="primary"
          :disabled="modalLoading"
          :loading="confirmBtnLoading"
          v-bind="confirmBtnProps"
          @click="onModalConfirm"
        >
          确定
        </a-button>
      </slot>
    </template>
  </a-modal>
</template>

<script setup lang="ts" name="BasicModal">
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
.modal-content {
  width: 100%;
  padding: 24px;
  padding-bottom: 0px;
  &.scroll {
    overflow-y: auto;
  }
}

:global(.basic-modal .ant-modal-body) {
  padding: 0px;
}
:global(.basic-modal .ant-modal-footer) {
  border-top: none;
}
</style>
