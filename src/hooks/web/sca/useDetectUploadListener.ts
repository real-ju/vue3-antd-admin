import type { Ref } from 'vue';

import { watch } from 'vue';
import { useScaLayoutStore } from '/@/store/modules/sca/layout';

interface DetectUploadListenerConfig {
  tableData: Ref<Recordable[]>; // 检测项列表数据
  onUploadFinished: () => void; // 列表中有检测项上传完成时触发
}

/**
 * 检查项上传监听
 */
export const useDetectUploadListener = (config: DetectUploadListenerConfig) => {
  const scaLayoutStore = useScaLayoutStore();
  const tableDataIds = computed<string[]>(() => {
    return config.tableData.value.map((item) => item.id);
  });
  const { pause: pauseWatch, resume: resumeWatch } = watch(
    () => scaLayoutStore.detectUploadFileDetail,
    (newVal, oldVal) => {
      const oldIds = Array.from(oldVal.keys());
      const newIds = Array.from(newVal.keys());
      console.log(oldIds, newIds, '=========>oldIds, newIds');
      // 上传完成后从Map中移除的检测项
      const removeIds = oldIds.filter((id) => !newIds.includes(id));
      // 判断是否有检测项上传完成
      if (removeIds.length > 0) {
        const removeId = removeIds.find((id) => tableDataIds.value.includes(id));
        // 判断上传完成的检测项是否在当前列表数据中
        if (removeId) {
          config.onUploadFinished();
        }
      }
    },
    {
      deep: true
    }
  );
  onActivated(() => {
    resumeWatch();
  });
  onDeactivated(() => {
    pauseWatch();
  });
};
