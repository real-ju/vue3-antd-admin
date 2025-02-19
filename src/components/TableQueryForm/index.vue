<template>
  <div class="table-query-form">
    <Form
      ref="formRef"
      :model="model"
      :label-col="formLabelCol"
      :wrapper-col="formWrapperCol"
      labelWrap
      autocomplete="off"
    >
      <Row :gutter="30">
        <FormItemCols
          :isCollapsed="isCollapsed"
          :maxColNum="maxColNum"
          :colNumMap="formItemColNumMap"
          :grid="formItemGrid"
        >
          <slot v-if="hasDefaultSlots"></slot>
          <template v-else>
            <FormItem v-for="item in visibleConfig" :key="item.name" :name="item.name">
              <!-- 显示placeholder提示 -->
              <Tooltip color="#ffffff" v-if="item.placeholderTip">
                <template #title>
                  <span class="primary-color">{{ item.props?.placeholder }}</span>
                </template>
                <slot v-if="item.type === 'custom'" :name="`field-${item.name}-slot`"></slot>
                <PrecisionInput
                  v-else-if="item.type === 'precision-input'"
                  v-model:value="model[item.modelFields[1]]"
                  v-model:type="model[item.modelFields[0]]"
                  v-model:isPrecision="model[item.modelFields[2]]"
                  v-bind="item.props || {}"
                  v-on="item.on || getFieldCompDefaultOn(item)"
                >
                  <slot :name="`field-${item.name}-comp-slot`"></slot>
                </PrecisionInput>
                <Cascader
                  v-else-if="item.type === 'cascader'"
                  v-model:value="model[item.name]"
                  v-bind="item.props || {}"
                  v-on="item.on || getFieldCompDefaultOn(item)"
                >
                </Cascader>
                <component
                  v-else
                  :is="compMap[item.type]"
                  v-model:value="model[item.name]"
                  v-bind="item.props || {}"
                  v-on="item.on || getFieldCompDefaultOn(item)"
                >
                  <template #prefix v-if="item.type === 'input' && item.searchIcon">
                    <Icon form="regular" name="magnifying-glass" />
                  </template>
                  <slot :name="`field-${item.name}-comp-slot`"></slot>
                </component>
              </Tooltip>
              <!-- 同上面 -->
              <template v-else>
                <slot v-if="item.type === 'custom'" :name="`field-${item.name}-slot`"></slot>
                <PrecisionInput
                  v-else-if="item.type === 'precision-input'"
                  v-model:value="model[item.modelFields?.[1]]"
                  v-model:type="model[item.modelFields?.[0]]"
                  v-model:isPrecision="model[item.modelFields?.[2]]"
                  v-bind="item.props || {}"
                  v-on="item.on || getFieldCompDefaultOn(item)"
                >
                  <slot :name="`field-${item.name}-comp-slot`"></slot>
                </PrecisionInput>
                <Cascader
                  v-else-if="item.type === 'cascader'"
                  v-model:value="model[item.name]"
                  v-bind="item.props || {}"
                  v-on="item.on || getFieldCompDefaultOn(item)"
                >
                </Cascader>
                <component
                  v-else
                  :is="compMap[item.type]"
                  v-model:value="model[item.name]"
                  v-bind="item.props || {}"
                  v-on="item.on || getFieldCompDefaultOn(item)"
                >
                  <template #prefix v-if="item.type === 'input' && item.searchIcon">
                    <Icon form="regular" name="magnifying-glass" />
                  </template>
                  <slot :name="`field-${item.name}-comp-slot`"></slot>
                </component>
              </template>
            </FormItem>
          </template>
        </FormItemCols>
        <Col
          class="query-form-action-col"
          :span="eachColGridNum"
          :lg="inContainer ? null : eachColGridNum"
          :xl="inContainer ? null : eachColGridNum"
          :xxl="inContainer ? null : eachColGridNum"
        >
          <Button class="query-form-action-btn" type="primary" @click="search">
            <Icon name="magnifying-glass"></Icon>
          </Button>
          <Button class="query-form-action-btn" type="primary" ghost @click="reset">
            <Icon name="rotate-right" form="solid"></Icon>
          </Button>
          <Button
            v-if="needCollapsed"
            class="query-form-action-btn"
            type="link"
            @click="switchCollapsed"
          >
            <span>{{ isCollapsed ? '展开' : '收起' }}</span>
            <Icon type="ant" :name="isCollapsed ? 'DownOutlined' : 'UpOutlined'" />
          </Button>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { FormInstance } from 'ant-design-vue';

import { computed, ref, useSlots } from 'vue';
import { useWindowSize } from '@vueuse/core';
import FormItemCols from './FormItemCols.vue';
import PrecisionInput from './PrecisionInput.vue';
import { cloneDeep } from 'lodash-es';
import {
  Input,
  Select,
  DatePicker,
  RangePicker,
  Cascader,
  Form,
  FormItem,
  Row,
  Col,
  Tooltip,
  Button
} from 'ant-design-vue/es';
import Icon from '../Icon';

interface ConfigItem {
  name: string;
  modelFields?: string[]; // 定义关联的model数据域（一般通过name进行匹配，如果有多个绑定的数据域则需要指定）
  show?: boolean;
  placeholderTip?: boolean;
  searchIcon?: boolean;
  type:
    | 'input'
    | 'select'
    | 'precision-input'
    | 'date-picker'
    | 'range-picker'
    | 'cascader'
    | 'custom'; // custom表示自定义域组件，通过field-xxx-slot传入
  props?: Recordable; // 传给v-bind
  on?: Recordable; // 传给v-on
}

type Config = ConfigItem[];

const compMap: Record<string, any> = {
  input: Input,
  select: Select,
  'date-picker': DatePicker,
  'range-picker': RangePicker,
  cascader: Cascader
};

const props = defineProps({
  config: {
    type: Array as PropType<Config>,
    default() {
      return [];
    }
  },
  model: {
    type: Object as PropType<Recordable>,
    default() {
      return {};
    }
  },
  /**
   * 控制每个表单域的布局占比
   * 例如：{
   *  xxx: {
        span: 12,
        lg: 12,
        xl: 8,
        xxl: 6
      }
   * }
   */
  grid: {
    type: Object as PropType<Recordable>,
    default() {
      return {};
    }
  },
  labelFixWidth: {
    type: Boolean,
    default: true
  },
  selectionFlag: {
    type: String,
    default: 'general'
  },
  selectedRows: {
    type: Array as PropType<Recordable[]>,
    default() {
      return [];
    }
  },
  reverseSelectedRows: {
    type: Array as PropType<Recordable[]>,
    default() {
      return [];
    }
  },
  basicTableRef: {
    type: Object,
    default: undefined
  },
  // 是否在容器内使用，比如弹窗
  inContainer: {
    type: Boolean,
    default: false
  },
  // 容器宽度
  containerWidth: {
    type: Number,
    default: 800
  }
});

const emit = defineEmits([
  'update:model',
  'update:selectionFlag',
  'update:selectedRows',
  'update:reverseSelectedRows',
  'resetTableData',
  'search',
  'reset',
  'collapse'
]);

const visibleConfig = computed(() => {
  return props.config.filter((item) => item.show !== false);
});

const getFieldCompDefaultOn = (item: ConfigItem) => {
  if (item.type === 'input') {
    return {
      pressEnter: () => {
        search();
      }
    };
  } else {
    return {};
  }
};

const slots = useSlots();
const hasDefaultSlots = computed(() => {
  return !!slots.default;
});
const defaultSlots = computed(() => {
  if (!hasDefaultSlots.value) {
    return [];
  }
  let rst = slots.default!();
  rst = rst.filter((item) => {
    return (item.type as any).name === 'AFormItem';
  });
  return rst;
});

const { width: windowWidth } = useWindowSize();
const containerSize = computed(() => {
  // containerWidth加上侧边栏宽度
  const width = props.inContainer ? props.containerWidth + 250 : windowWidth.value;
  if (width < 992) {
    return 'span';
  } else if (width < 1200) {
    return 'lg';
  } else if (width < 1600) {
    return 'xl';
  } else {
    return 'xxl';
  }
});
// 最大列数
const maxColNum = computed(() => {
  if (containerSize.value === 'span') {
    return 2;
  } else if (containerSize.value === 'lg') {
    return 2;
  } else if (containerSize.value === 'xl') {
    return 3;
  } else {
    // xxl
    return 4;
  }
});
// 每列网格数
const eachColGridNum = computed(() => {
  return 24 / maxColNum.value;
});

const defaultGrid = {
  span: 12,
  lg: 12,
  xl: 8,
  xxl: 6
};
// FormItem栅格配置
const formItemGrid = computed(() => {
  const map: Recordable = {};
  const list: any[] = hasDefaultSlots.value ? defaultSlots.value : props.config;
  list.forEach((item) => {
    const name = hasDefaultSlots.value ? item.props?.name : item.name;
    if (!name) {
      return;
    }
    const grid = props.inContainer
      ? {
          span: props.grid[name]?.[containerSize.value] || eachColGridNum.value
        }
      : {
          ...defaultGrid,
          ...(props.grid[name] || {})
        };
    map[name] = grid;
  });
  return map;
});
// FormItem所占列数Map
const formItemColNumMap = computed(() => {
  const map: Recordable<number> = {};
  const list: any[] = hasDefaultSlots.value ? defaultSlots.value : props.config;
  list.forEach((item) => {
    const name = hasDefaultSlots.value ? item.props?.name : item.name;
    if (!name) {
      return;
    }
    let colNum =
      (formItemGrid.value[name][containerSize.value] || eachColGridNum.value) /
      eachColGridNum.value;
    if (!Number.isInteger(colNum)) {
      colNum = Math.floor(colNum) + 1;
    }
    map[name] = colNum;
  });
  return map;
});
// FormItem所占总列数
const formItemTotalColNum = computed(() => {
  const list: any[] = hasDefaultSlots.value ? defaultSlots.value : props.config;
  return list.reduce((acc, item) => {
    const name = hasDefaultSlots.value ? item.props?.name : item.name;
    return name ? acc + formItemColNumMap.value[name] : acc + 1;
  }, 0);
});

const needCollapsed = computed(() => {
  return formItemTotalColNum.value > maxColNum.value - 1;
});

// const handleResize = () => {
//   needCollapsed.value = formItemTotalColNum.value > maxColNum.value - 1;
// };

// handleResize();

// watch(windowWidth, handleResize);

const isCollapsed = ref(true);

const formRef = ref<FormInstance>();
const defaultModel = cloneDeep(props.model);

const switchCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
  props.basicTableRef?.updateTableHeight();
  emit('collapse');
};

const search = () => {
  emit('update:selectionFlag', 'general');
  emit('update:selectedRows', []);
  emit('update:reverseSelectedRows', []);
  emit('resetTableData');
  emit('search');
};

const reset = () => {
  formRef.value!.resetFields();
  emit('update:model', cloneDeep(defaultModel));
  emit('update:selectionFlag', 'general');
  emit('update:selectedRows', []);
  emit('update:reverseSelectedRows', []);
  emit('resetTableData');
  emit('reset');
};

const formLabelCol = computed(() => {
  return props.labelFixWidth ? { span: 8 } : undefined;
});

const formWrapperCol = computed(() => {
  return props.labelFixWidth ? { span: 16 } : undefined;
});

defineExpose({
  search,
  reset
});
</script>

<style lang="less" scoped>
.table-query-form {
  width: 100%;

  .query-form-action-col {
    height: 44px;
    .query-form-action-btn {
      padding: 4px 10px;
      & + .query-form-action-btn {
        margin-left: 20px;
      }
      i {
        font-size: 13px;
      }
    }
  }

  :deep {
    .ant-form-item {
      margin-bottom: 12px;
    }
    .ant-form-item-explain {
      min-height: 12px;
      font-size: 12px;
      line-height: 1;
    }
    .ant-picker {
      width: 100%;
    }
  }
}
</style>
