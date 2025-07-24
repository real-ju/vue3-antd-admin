/**
 * 字符串首字母大写
 */
export function firstLetterToUpperCase(str: string) {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
