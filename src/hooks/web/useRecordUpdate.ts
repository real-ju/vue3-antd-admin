import type { Ref } from 'vue';
import type { IconProps } from '/@/components';

import { usePageUpdateStore } from '/@/store/modules/pageUpdate';
import { useLayoutStore } from '/@/store/modules/layout';
import { message } from 'ant-design-vue/es';

export interface ModuleDataForm {
  type: 'form' | 'table' | 'custom';
  ref?: Ref; // type!=custom时必填
  columns?: Recordable[] | Ref<Recordable[]>; // type=table时
  model?: any | Ref<any>; // type!=custom时必填
  rules?: Recordable | Ref<Recordable>; // type!=custom时必填
  dataModels?: Ref<Recordable[]>; // type=custom时可用，用于待完善标志的判断
  validate?: () => Promise<void>; // type=custom时必填
}

export interface ModuleData {
  onlyShowIn?: 'add' | 'edit';
  title: string;
  icon: IconProps;
  incomplete?: Ref<boolean>; // 内部添加
  form: ModuleDataForm | Recordable<ModuleDataForm>;
  saveRequest?: (extra: Recordable) => Promise<void>; // saveMode=module-standalone时必填
  saveLoading?: boolean; // 内部添加
  saveTip?: boolean; // 内部添加
}

export type ModulesData = Recordable<ModuleData>;

export interface RecordUpdateConfig {
  saveMode: 'general' | 'module-standalone';
  modulesData: ModulesData;
  backUrl: string;
  saveRequest?: (extra: Recordable) => Promise<void>; // saveMode=general时必填
  addRequest?: (extra: Recordable) => Promise<void>; // saveMode=module-standalone时必填
  openIncompleteTip?: () => void; // saveMode=module-standalone时必填
  navToModule: (moduleKey: string) => void;
  recordName: string;
  backFillData: () => Promise<{ dataName: string }>;
}

/**
 * 列表数据新增、编辑页面
 */
export const useRecordUpdate = (config?: RecordUpdateConfig) => {
  const layoutStore = useLayoutStore();
  const router = useRouter();
  const route = useRoute();
  const pageUpdateStore = usePageUpdateStore();

  const { query } = route;
  let { updateType = 'add' } = query;
  updateType = String(updateType);

  const modulesData = reactive<ModulesData>({});

  // 创建待完善标志
  const generateIncompleteFlag = (moduleKey: string) => {
    return computed(() => {
      const module = modulesData[moduleKey];
      const dataModels: Recordable[] = [];
      const collectDataModels = (form: ModuleDataForm) => {
        const formType = form.type;
        const models: Recordable[] = [];
        if (formType === 'form') {
          models.push(unref(form.model));
        } else if (formType === 'table') {
          models.push(...unref(form.model));
        } else if (formType === 'custom') {
          models.push(...(unref(form.dataModels) || []));
        }
        models.forEach((item) => {
          item._rules = unref(form.rules);
        });
        dataModels.push(...models);
      };
      if (module.form.type) {
        collectDataModels(module.form as ModuleDataForm);
      } else {
        Object.keys(module.form).forEach((formKey) => {
          collectDataModels((module.form as Recordable<ModuleDataForm>)[formKey]);
        });
      }
      let incomplete = false;
      dataModels.forEach((model: Recordable) => {
        for (const key in model._rules) {
          if (Object.prototype.hasOwnProperty.call(model._rules, key)) {
            const item = model._rules[key];
            if (item[0]?.required) {
              if (Array.isArray(model[key])) {
                if (model[key].length === 0) {
                  incomplete = true;
                  break;
                }
              } else {
                if (!model[key]) {
                  incomplete = true;
                  break;
                }
              }
            }
          }
        }
      });
      return incomplete;
    });
  };

  // 创建表单验证函数
  const generateFormValidateFunc = (form: ModuleDataForm) => {
    if (form.type === 'custom') {
      return;
    }
    form.validate = async () => {
      if (form.type === 'form') {
        await form.ref!.value!.validate();
      } else if (form.type === 'table') {
        await form.ref!.value!.formRef.validate();
      }
    };
  };

  // 处理modulesData
  if (config) {
    Object.keys(config.modulesData).forEach((moduleKey) => {
      const module = config.modulesData[moduleKey];
      // 过滤显示的模块
      if (!module.onlyShowIn || module.onlyShowIn === updateType) {
        // 创建待完善标志
        module.incomplete = generateIncompleteFlag(moduleKey);
        // 创建表单验证函数
        if (module.form.type) {
          generateFormValidateFunc(module.form as ModuleDataForm);
        } else {
          Object.keys(module.form).forEach((formKey) => {
            generateFormValidateFunc((module.form as Recordable<ModuleDataForm>)[formKey]);
          });
        }
        // 创建保存加载和未保存提示
        module.saveLoading = false;
        module.saveTip = false;
        modulesData[moduleKey] = module;
      }
    });
  }

  const validateForm = async (moduleKey: string, formKey?: string) => {
    const form = modulesData[moduleKey].form;
    if (formKey) {
      await (form as Recordable<ModuleDataForm>)[formKey]!.validate!();
    } else {
      await (form as ModuleDataForm).validate!();
    }
  };

  const validateModule = async (moduleKey?: string) => {
    if (moduleKey) {
      // 验证单个模块
      const form = modulesData[moduleKey].form;
      if (form.type) {
        await validateForm(moduleKey);
      } else {
        const pList: Array<Promise<void>> = [];
        Object.keys(form).forEach((formKey) => {
          pList.push(validateForm(moduleKey, formKey));
        });
        await Promise.all(pList);
      }
    } else {
      // 验证所有模块
      const pList: Array<Promise<void>> = [];
      Object.keys(modulesData).forEach((moduleKey) => {
        pList.push(validateModule(moduleKey));
      });
      await Promise.all(pList);
    }
  };

  // 开启保存提示监听
  const openSaveTipWatch = () => {
    if (!config) {
      return;
    }
    if (
      config.saveMode === 'general' ||
      (config.saveMode === 'module-standalone' && updateType !== 'edit')
    ) {
      return;
    }
    const watchFormModel = (form: ModuleDataForm, module: ModuleData) => {
      const formType = form.type;
      if (formType !== 'custom') {
        watch(form.model, () => {
          module.saveTip = true;
        });
      } else {
        if (form.dataModels) {
          watch(form.dataModels, () => {
            module.saveTip = true;
          });
        }
      }
    };
    Object.keys(modulesData).forEach((moduleKey) => {
      const module = modulesData[moduleKey];
      if (module.form.type) {
        watchFormModel(module.form as ModuleDataForm, module);
      } else {
        Object.keys(module.form).forEach((formKey) => {
          watchFormModel((module.form as Recordable<ModuleDataForm>)[formKey], module);
        });
      }
    });
  };

  const saveLoading = ref(false);

  // 返回
  const goBack = () => {
    layoutStore.closePageTab(route);
    router.push(String(config?.backUrl));
  };

  // saveMode=general时保存
  const generalSave = async (extra: Recordable) => {
    try {
      await validateModule();
    } catch (error) {
      navToFirstIncompleteModule();
      throw error;
    }
    saveLoading.value = true;
    try {
      await config!.saveRequest!(extra);
    } finally {
      saveLoading.value = false;
    }
  };

  // saveMode=module-standalone时新增
  const add = async (extra: Recordable) => {
    try {
      await validateModule();
    } catch (error) {
      navToFirstIncompleteModule();
      throw error;
    }
    saveLoading.value = true;
    try {
      await config!.addRequest!(extra);
    } finally {
      saveLoading.value = false;
    }
  };

  // saveMode=module-standalone时保存模块
  const moduleSave = async (moduleKey: string, allSave = false) => {
    if (!allSave) {
      await validateModule(moduleKey);
    }
    const module = modulesData[moduleKey];
    module.saveLoading = true;
    try {
      await module.saveRequest!({
        allSave
      });
      module.saveTip = false;
    } finally {
      module.saveLoading = false;
    }
  };

  // saveMode=module-standalone时全部保存
  const moduleStandaloneSave = async () => {
    const moduleKeys: string[] = [];
    const validatePromises: Array<Promise<void>> = [];
    Object.keys(modulesData).forEach((moduleKey) => {
      moduleKeys.push(moduleKey);
      validatePromises.push(validateModule(moduleKey));
    });
    Promise.allSettled(validatePromises).then((res) => {
      // 验证通过和未通过的模块
      const passModuleKeys: string[] = [];
      const nopassModuleKeys: string[] = [];
      res.forEach((item, index) => {
        if (item.status === 'fulfilled') {
          passModuleKeys.push(moduleKeys[index]);
        } else {
          nopassModuleKeys.push(moduleKeys[index]);
        }
      });
      // 有验证通过的模块时
      if (passModuleKeys.length > 0) {
        // 保存验证通过的模块
        saveLoading.value = true;
        const requestPromises: Array<Promise<any>> = [];
        passModuleKeys.forEach((moduleKey) => {
          requestPromises.push(moduleSave(moduleKey, true));
        });
        Promise.allSettled(requestPromises).then((res) => {
          saveLoading.value = false;
          if (nopassModuleKeys.length === 0) {
            message.success('保存成功');
            layoutStore.closePageTab(route);
            goBack();
          } else {
            config?.openIncompleteTip!();
          }
        });
      } else {
        navToFirstIncompleteModule();
      }
    });
  };

  // 获取第一个待完善的模块名，没有则为空字符
  const getFirstIncompleteModuleKey = () => {
    let incompleteKey = '';
    for (const moduleKey in modulesData) {
      if (Object.prototype.hasOwnProperty.call(modulesData, moduleKey)) {
        const module = modulesData[moduleKey];
        if (module.incomplete) {
          incompleteKey = moduleKey;
          break;
        }
      }
    }
    return incompleteKey;
  };

  // 跳转到第一个待完善的模块
  const navToFirstIncompleteModule = () => {
    const moduleKey = getFirstIncompleteModuleKey();
    if (moduleKey) {
      config?.navToModule(moduleKey);
    }
  };

  const pageLoading = ref(false);

  const backFillData = async () => {
    try {
      pageLoading.value = true;
      const { dataName } = await config!.backFillData();
      openSaveTipWatch();
      pageLoading.value = false;
      layoutStore.openPageTab(route, `编辑-${dataName}`);
    } catch {
      layoutStore.openPageTab(route, `编辑${config!.recordName}`);
    }
  };

  // 表单布局
  const formLayoutProps = {
    layout: 'horizontal',
    labelCol: { span: 5 },
    wrapperCol: { span: 16 }
  };

  const init = () => {
    if (updateType === 'add') {
      layoutStore.openPageTab(route, `新增${config!.recordName}`);
    } else {
      backFillData();
    }
  };

  if (config) {
    init();
  }

  return {
    query,
    resetList: pageUpdateStore.addNeedUpdatePage,
    updateType,
    // 以下传入config后可用
    modulesData,
    validateForm,
    validateModule,
    openSaveTipWatch,
    saveLoading,
    goBack,
    generalSave,
    add,
    moduleSave,
    moduleStandaloneSave,
    navToFirstIncompleteModule,
    pageLoading,
    formLayoutProps
  };
};
