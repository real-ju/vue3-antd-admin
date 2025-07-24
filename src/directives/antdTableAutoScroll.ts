import type { App, Directive, DirectiveBinding } from 'vue';

let timmer: Nullable<number> = null;
let hasRegMouseListener = false;

interface Config {
  duration: number; // 秒
}

const antdTableAutoScrollDirective: Directive = function (
  el: HTMLElement,
  binding: DirectiveBinding<Config>
) {
  if (!binding.value?.duration) {
    console.error('请配置duration');
    return;
  }

  const scrollEl = el.querySelector('.ant-table-body');
  if (!scrollEl) {
    console.error('没有找到.ant-table-body元素');
    return;
  }

  if (scrollEl.scrollHeight - scrollEl.clientHeight === 0) {
    return;
  }

  const cancelAnimation = () => {
    if (timmer) {
      window.cancelAnimationFrame(timmer);
      timmer = null;
    }
  };

  const initAnimation = () => {
    if (timmer) {
      return;
    }
    const beginTime = new Date().getTime();
    const beginScrollTop = scrollEl.scrollTop;
    const durationTime = binding.value.duration * 1000;
    const scroll = () => {
      const currentTime = new Date().getTime();
      const scrollRatio = ((currentTime - beginTime) % durationTime) / durationTime;
      const scrollMax = scrollEl.scrollHeight - scrollEl.clientHeight;
      const scrollTop = beginScrollTop + scrollMax * scrollRatio;
      scrollEl.scroll(
        0,
        scrollTop <= scrollMax ? scrollTop : scrollMax * scrollRatio - (scrollMax - beginScrollTop)
      );
      timmer = window.requestAnimationFrame(scroll);
    };
    timmer = window.requestAnimationFrame(scroll);
  };

  // 第一次挂载时
  if (!binding.oldValue) {
    initAnimation();
  } else {
    if (binding.value !== binding.oldValue) {
      if (timmer) {
        cancelAnimation();
        initAnimation();
      }
    }
  }

  if (!hasRegMouseListener) {
    scrollEl.addEventListener('mouseenter', () => {
      cancelAnimation();
    });
    scrollEl.addEventListener('mouseleave', () => {
      initAnimation();
    });
    hasRegMouseListener = true;
  }
};

export function setupAntdTableAutoScrollDirective(app: App) {
  app.directive('antd-table-auto-scroll', antdTableAutoScrollDirective);
}

export default antdTableAutoScrollDirective;
