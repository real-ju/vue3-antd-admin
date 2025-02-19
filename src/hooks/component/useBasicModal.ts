import type { Recordable } from '../../../types/global';

interface BasicModalConfig {
  mode?: 'general' | 'recordUpdate'; // recordUpdate-仅在新增/编辑列表数据弹窗使用
  title?: String;
  recordName?: String; // mode=recordUpdate
  modalProps?: Recordable;
  onModalConfirm: Function;
  onModalOpen?: Function;
}

interface BasicModalContext {
  props: Recordable;
  emit: Function;
}

export const getModalProps = (mode: 'general' | 'recordUpdate' = 'general') => {
  let modalProps: Recordable = {
    visible: {
      type: Boolean,
      default: false
    }
  };
  if (mode === 'recordUpdate') {
    modalProps = {
      ...modalProps,
      updateType: {
        type: String,
        default: 'add'
      },
      record: {
        type: Object,
        default() {
          return null;
        }
      }
    };
  }
  return modalProps;
};

export const modalEmits = ['update:visible'];

export const useBasicModal = (config: BasicModalConfig, context: BasicModalContext) => {
  config.mode = config.mode || 'general';

  const modalLoading = ref(false);
  const confirmBtnLoading = ref(false);

  let customModalProps: Recordable = {
    maskClosable: false
  };
  if (config.mode === 'recordUpdate') {
    customModalProps = {
      ...customModalProps,
      title: computed(() => {
        if (context!.props.updateType === 'view') {
          return config.recordName + updateTypeText.value;
        } else {
          return updateTypeText.value + config.recordName;
        }
      })
    };
  } else {
    customModalProps = {
      ...customModalProps,
      title: config.title
    };
  }
  customModalProps = {
    ...customModalProps,
    ...config.modalProps
  };
  const basicModalProps = reactive({
    visible: computed(() => context.props.visible),
    modalProps: reactive(customModalProps),
    modalLoading: modalLoading,
    confirmBtnLoading: confirmBtnLoading
  });

  const onUpdateVisible = (visible: boolean) => {
    context.emit('update:visible', visible);
  };
  const basicModalEvents = {
    'update:visible': onUpdateVisible,
    modalConfirm: config.onModalConfirm
  };

  const closeModal = () => {
    context.emit('update:visible', false);
  };

  watch(
    () => context.props.visible,
    (val) => {
      if (val) {
        config.onModalOpen?.();
      }
    }
  );

  const updateTypeText = computed(() => {
    const map: Recordable<string> = {
      add: '新增',
      edit: '编辑',
      view: '详情'
    };
    return map[context.props.updateType];
  });

  const isViewMode = computed(() => {
    return context.props.updateType === 'view';
  });

  return {
    basicModalProps,
    basicModalEvents,
    modalLoading,
    confirmBtnLoading,
    closeModal,
    updateTypeText,
    isViewMode
  };
};
