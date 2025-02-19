<template>
  <div class="info-box-radio">
    <div
      class="item"
      :class="{ checked: item.value === value, disabled: item.disabled }"
      v-for="item in options"
      :key="item.value"
      @click="onCheck(item)"
    >
      <div class="title-area">
        <div class="title">{{ item.title }}</div>
        <template v-if="item.icon">
          <Icon
            v-if="customIcon"
            :type="item.icon.type"
            :name="item.icon.name"
            :form="item.icon.form"
            style="font-size: 40px"
          >
          </Icon>
          <div v-else class="icon">
            <Icon :type="item.icon.type" :name="item.icon.name" :form="item.icon.form"></Icon>
          </div>
        </template>
      </div>
      <div v-if="item.desc" class="desc">
        <div>{{ item.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import { default as Icon, Props as IconProps } from '../Icon';

interface Option {
  title: string;
  value: string | number;
  icon: IconProps;
  desc: string;
  disabled?: boolean;
}

const props = defineProps({
  value: {
    type: [String, Number],
    default: undefined
  },
  options: {
    type: Array as PropType<Option[]>,
    default: () => {
      return [];
    }
  },
  customIcon: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:value']);

const onCheck = (item: Option) => {
  if (item.disabled) {
    return;
  }
  emit('update:value', item.value);
};
</script>

<style lang="less" scoped>
@import '../../design/theme/default/global.less';

.info-box-radio {
  display: flex;
  align-items: stretch;
  .item {
    width: 240px;
    padding: 10px 16px;
    border: 1px solid #ced4da;
    border-radius: 3px;
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;
    .title-area {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        color: @text-color;
        font-size: 14px;
        transition: color 0.2s;
      }
      .icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #bbbbbb;
        color: #ffffff;
        font-size: 16px;
        transition: background-color 0.2s;
      }
    }
    .desc {
      margin-top: 10px;
      font-size: 12px;
      color: #999999;
      white-space: pre-wrap;
    }
    &:not(.disabled):hover {
      border-color: @primary-color;
      background-color: fade(@primary-color, 5%);
      .title {
        color: @primary-color;
      }
      .icon {
        background-color: @primary-color;
      }
    }
    & + .item {
      margin-left: 10px;
    }
    &.checked {
      border-color: @primary-color;
      background-color: fade(@primary-color, 5%);
      .title {
        color: @primary-color;
      }
      .icon {
        background-color: @primary-color;
      }
    }
    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
