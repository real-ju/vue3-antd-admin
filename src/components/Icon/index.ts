import type { App } from 'vue';
import type { Recordable } from '@cqcdi/core-types';

import SvgIcon from './src/SvgIcon/index.vue';
import * as AntIcons from '@ant-design/icons-vue';
import { createFromIconfontCN } from '@ant-design/icons-vue';
import { h } from 'vue';

export interface Props {
  type?: 'ant' | 'iconfont' | 'svg' | 'ali';
  name?: string; // type!=iconfont时必填
  form?: string;
  customClass?: string; // type=iconfont时生效，传入后上面三个可以不传
}

let AliIconFont: any = null;

/**
 * 创建阿里巴巴图标组件
 */
export const createAliIconFont = (scriptUrl: string) => {
  AliIconFont = createFromIconfontCN({
    scriptUrl
  });
};

const Icon: any = (props: Props) => {
  const { type = 'iconfont', name, form = 'regular', customClass } = props;
  if (type !== 'iconfont' && !name) {
    return;
  }

  if (type === 'ant') {
    return h((AntIcons as Recordable)[name!]);
  } else if (type === 'iconfont') {
    return h('i', {
      class: customClass || {
        [`fa-${form}`]: true,
        [`fa-${name}`]: true
      }
    });
  } else if (type === 'svg') {
    return h(SvgIcon, { name: name! });
  } else if (type === 'ali') {
    if (AliIconFont) {
      return h(AliIconFont, { type: `icon-${name!}` });
    } else {
      return h('span', '-');
    }
  }
};

Icon.install = (app: App, options?: Recordable) => {
  if (options?.AliIconFontScriptUrl) {
    createAliIconFont(options.AliIconFontScriptUrl);
  }
  app.component('Icon', Icon);
};

export default Icon;
