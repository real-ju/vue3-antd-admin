import CryptoJS from 'crypto-js';

export const AES_KEY: string = 'tZ4QkX9v7gYJ2nL6WpBcH8sD1fR3mNqP';

// AES加密
export function AESEncrypt(word: string) {
  let srcs = CryptoJS.enc.Utf8.parse(word);
  let key = CryptoJS.enc.Utf8.parse(AES_KEY);
  let encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString();
}

// AES解密
export function AESDecrypt(word: string) {
  let key = CryptoJS.enc.Utf8.parse(AES_KEY);
  let decrypt = CryptoJS.AES.decrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });

  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}
