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
