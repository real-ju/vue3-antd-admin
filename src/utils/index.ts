/**
 * 生成UUID
 */
export function generateUUID(): string {
  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set version bits to 4 (0100)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant bits to RFC 4122 (10xxxxxx)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return [
    bytesToHex(bytes.subarray(0, 4)),
    bytesToHex(bytes.subarray(4, 6)),
    bytesToHex(bytes.subarray(6, 8)),
    bytesToHex(bytes.subarray(8, 10)),
    bytesToHex(bytes.subarray(10, 16))
  ].join('-');
}

/**
 * 生成随机密码
 * https://juejin.cn/post/7108729061911822344
 */
export function generatePassword(
  lower = true,
  upper = true,
  number = true,
  symbol = true,
  length = 8
) {
  const getRandomUpper = () => {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  };
  const getRandomLower = () => {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  };
  const getRandomNumber = () => {
    return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
  };
  const getRandomSymbol = () => {
    const symbols = '!@#$%^&*';
    return symbols[Math.floor(Math.random() * symbols.length)];
  };
  const randomFunc: Recordable = {
    upper: getRandomUpper,
    lower: getRandomLower,
    number: getRandomNumber,
    symbol: getRandomSymbol
  };

  let generatedPassword = '';
  // @ts-ignore
  const typesCount = lower + upper + number + symbol;
  //Object.values(item)[0] 获取数组中每个对象的值
  // 筛选出值为true(状态为选中的)的大写英文字母、小写英文字母、数字、特殊符号
  const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(
    (item) => Object.values(item)[0]
  );
  // 状态都为未选中，则都为flase，加起来就是0；直接返回
  if (typesCount === 0) {
    return false;
  }

  for (let i = 0; i < length; i += typesCount) {
    // 遍历循环状态为选中的对象组成的数组，获取每个对象的属性名，根据属性名调用各自生成函数
    typesArr.forEach((type) => {
      const funcName = Object.keys(type)[0];
      generatedPassword += randomFunc[funcName]();
    });
  }
  // 截取选择的密码位数长度的随机密码
  const finalPassword = generatedPassword.slice(0, length);
  return finalPassword;
}

/**
 * 从路径或URL中解析文件名
 * @param path 路径或URL
 */
export function resolveFileNameFromPath(path: string): string {
  const arr1 = path.split('/');
  const arr2 = arr1[arr1.length - 1].split('.');
  return arr2[0];
}

/**
 * 从路径或URL中解析文件后缀名
 * @param path 路径或URL
 */
export function resolveFileSuffixFromPath(path: string): string {
  const arr = path.split('.');
  return arr[arr.length - 1];
}

/**
 * 将一个函数防抖化
 * @param fn 原函数
 * @param wait 间隔时间
 * @returns 防抖函数(取消平A，重置前摇。最后一次操作有意义)
 */
export function debounce(fn: Function, wait: number) {
  let timer: NodeJS.Timeout | null = null;
  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

/**
 * 将一个函数节流化
 * @param fn 原函数
 * @param wait 间隔时间
 * @returns 节流函数(技能CD。每次操作都有意义)
 */
export function throttle(fn: Function, wait: number) {
  let timer: NodeJS.Timeout | null = null;
  return function (this: any, ...args: any[]) {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, wait);
  };
}

export function convertSecondsToHMS(totalSeconds: number) {
  let hours = Math.floor(totalSeconds / 3600);

  let remainingSeconds = totalSeconds % 3600;

  let minutes = Math.floor(remainingSeconds / 60);

  let seconds = remainingSeconds % 60;

  let showTime = '';
  if (hours) {
    showTime = hours + '小时';
  }
  if (minutes) {
    showTime = showTime + minutes + '小时';
  }
  if (seconds) {
    showTime = showTime + seconds + '小时';
  }
  return `${hours}:${minutes}:${seconds}`;
}
