<template>
  <Row class="form-item-group">
    <Col class="box" :span="24 - offset" :offset="offset">
      <slot></slot>
    </Col>
  </Row>
</template>

<script setup lang="ts">
import { Row, Col } from 'ant-design-vue/es';

const props = defineProps({
  offset: {
    type: Number,
    default: 5
  }
});
</script>

<style lang="less" scoped>
@import '../../design/theme/default/global.less';

.form-item-group {
  margin-top: -10px;
  margin-bottom: 24px;
  .box {
    border: 1px solid @primary-color;
    border-radius: 3px;
    background-color: fade(@primary-color, 5%);
    padding: 24px 16px 0px;
    overflow: hidden;
  }
}
</style>
