import type { Recordable } from '../../../types/global';

import { reactive } from 'vue';
import { firstLetterToUpperCase } from '../../utils/js/string';

interface BasicModalOuterConfig {
  mode?: 'general' | 'recordUpdate';
  name: string;
}

export const useBasicModalOuter = (config: BasicModalOuterConfig): Recordable => {
  config.mode = config.mode || 'general';

  let modalProps: Recordable = {
    visible: false
  };
  if (config.mode === 'recordUpdate') {
    modalProps = {
      ...modalProps,
      updateType: 'add',
      record: null
    };
  }
  modalProps = reactive(modalProps);

  const onModalUpdateVisible = (visible: boolean) => {
    modalProps.visible = visible;
  };
  const modalEvents = {
    'update:visible': onModalUpdateVisible
  };

  /**
   * mode=recordUpdate时，有三个参数：updateType,record,payload
   * mode=general时，有一个参数：payload
   * @param updateType
   * @param record
   * @param payload 一个对象，包含传给弹窗组件的其他props
   */
  const openModal = (...rest: any[]) => {
    if (config.mode === 'recordUpdate') {
      const [updateType = 'add', record = null, payload = {}] = rest;
      modalProps.updateType = updateType;
      modalProps.record = record;
      Object.assign(modalProps, payload);
    } else {
      const [payload = {}] = rest;
      Object.assign(modalProps, payload);
    }
    modalProps.visible = true;
  };

  return {
    [config.name + 'ModalProps']: modalProps,
    [config.name + 'ModalEvents']: modalEvents,
    [`open${firstLetterToUpperCase(config.name)}Modal`]: openModal
  };
};
