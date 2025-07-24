/**
 * 数组分组
 * @param arr 原数组
 * @param chunkSize 分组大小
 */
export function chunkArray(arr: any[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 数组字段翻译（常用于字典翻译）
 * @param arr 数组
 * @param origin 原字段
 * @param originValue 原字段值
 * @param target 目标字段
 * @returns 翻译后的值
 */
export function translate(
  arr: Recordable[],
  origin: string,
  originValue: string | number,
  target: string
): string | number {
  const item = arr.find((item) => item[origin] === originValue);
  if (!item) {
    return '';
  }
  return item[target];
}

/**
 * 数组转为map
 */
export function arrayToMap(arr: Recordable[], keyField: string, valueField: string): Recordable {
  const map: Recordable = {};
  arr.forEach((item) => {
    map[item[keyField]] = item[valueField];
  });
  return map;
}
