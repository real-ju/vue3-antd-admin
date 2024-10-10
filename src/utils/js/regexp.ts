/**
 * 判断字符串是否为IP地址
 */
export function isIP(str: string): boolean {
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(str);
}

/**
 * 判断字符串是否为手机号
 */
export function isPhone(str: string): boolean {
  const reg = /^1\d{10}$/;
  return reg.test(str);
}
