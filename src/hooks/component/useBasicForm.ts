import type { Ref } from 'vue';
import type { Recordable } from '../../../types/global';

import { reactive, ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import { firstLetterToUpperCase } from '../../utils/js/string';

interface BasicFormConfig {
  name?: string;
  ref?: Ref;
  defaultModel: Recordable;
  rules?: Recordable;
  layout?: 'horizontal' | 'vertical' | 'inline';
}

export const useBasicForm = (config: BasicFormConfig): Recordable => {
  config.name = config.name || '';

  const formRef = config.ref || ref();

  const formModel = ref<Recordable>(cloneDeep(config.defaultModel));

  const formRules = ref(config.rules || {});

  const formProps = reactive({
    ref: (el: any) => {
      formRef.value = el;
    },
    model: formModel,
    rules: formRules,
    autocomplete: 'off',
    layout: config.layout || 'horizontal'
  });

  const resetForm = () => {
    formModel.value = cloneDeep(config.defaultModel);
    formRef.value && formRef.value.clearValidate();
  };

  const formText = config.name ? 'Form' : 'form';
  return {
    [`${config.name}${formText}Props`]: formProps,
    [`${config.name}${formText}Ref`]: formRef,
    [`${config.name}${formText}Model`]: formModel,
    [`${config.name}${formText}Rules`]: formRules,
    [`reset${firstLetterToUpperCase(config.name)}Form`]: resetForm
  };
};
