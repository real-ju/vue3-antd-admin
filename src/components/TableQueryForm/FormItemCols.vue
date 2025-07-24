<script lang="ts">
import type { PropType, VNode } from 'vue';

import { defineComponent, h } from 'vue';
import { Col } from 'ant-design-vue/es';
import { Recordable, Nullable } from '@cqcdi/core-types';

export default defineComponent({
  name: 'FormItemCols',
  props: {
    isCollapsed: {
      type: Boolean,
      default: true
    },
    maxColNum: {
      type: Number,
      default: 4
    },
    colNumMap: {
      type: Object as PropType<Recordable>,
      default() {
        return {};
      }
    },
    grid: {
      type: Object as PropType<Recordable>,
      default() {
        return {};
      }
    }
  },
  setup(props, { slots }) {
    return () => {
      if (!slots.default) return null;
      const defaultSlots = slots.default();
      let formItemComps = defaultSlots[0].children! as VNode[];
      formItemComps = formItemComps.filter((item) => {
        return (item.type as any).name === 'AFormItem';
      });
      // 构建需要显示的FormItem
      const nodes = [];
      let accColNum = 0;
      for (let index = 0; index < formItemComps.length; index++) {
        const formItemComp = formItemComps[index];
        const formItemName = formItemComp.props?.name;
        // 所占列数
        const colNum = props.colNumMap[formItemName] || 1;
        let nodeStyle: Nullable<Recordable> = null;
        if (props.isCollapsed) {
          if (accColNum < props.maxColNum - 1) {
            nodeStyle = null;
            accColNum += colNum;
          } else {
            nodeStyle = {
              display: 'none'
            };
          }
        }
        const node = h(
          Col,
          {
            ...(props.grid[formItemName] || {}),
            style: nodeStyle
          },
          () => formItemComp
        );
        nodes.push(node);
      }
      return nodes;
    };
  }
});
</script>

<style lang="less" scoped></style>
