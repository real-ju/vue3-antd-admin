import type { Recordable } from '../../../types/global';

import { reactive, ref } from 'vue';

interface SimpleModalConfig {
  name: string;
  title: string;
  danger?: boolean;
  onModalConfirm: Function;
}

export const useSimpleModal = (config: SimpleModalConfig): Recordable => {
  const modalVisible = ref(false);
  const modalLoading = ref(false);

  const modalProps = reactive({
    visible: modalVisible,
    title: config.title,
    danger: config.danger,
    loading: modalLoading
  });

  const onModalUpdateVisible = (visible: boolean) => {
    modalVisible.value = visible;
  };
  const modalEvents = {
    'update:visible': onModalUpdateVisible,
    modalConfirm: config.onModalConfirm
  };

  return {
    [config.name + 'ModalProps']: modalProps,
    [config.name + 'ModalEvents']: modalEvents,
    [config.name + 'ModalVisible']: modalVisible,
    [config.name + 'ModalLoading']: modalLoading
  };
};
