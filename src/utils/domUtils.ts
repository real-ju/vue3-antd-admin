export function setDocTitle(title: string) {
  document.title = title;
}

/**
 * 设置网站标签页图标
 * @param {string} iconUrl - 图标路径（支持 .ico/.png/.svg 等格式）
 */
export function setWebFavicon(iconUrl: string) {
  // 方案1：使用link[rel="icon"]（现代浏览器标准）
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = iconUrl;
  if (iconUrl.endsWith('.svg')) {
    link.type = 'image/svg+xml';
  }

  // 方案2：兼容IE10及以下版本
  const legacyLink = document.createElement('link');
  legacyLink.rel = 'shortcut icon';
  legacyLink.href = iconUrl;

  // 移除现有图标
  const existingLinks = document.querySelectorAll('link[rel*="icon"], link[rel*="Icon"]');
  existingLinks.forEach((el) => el.parentNode?.removeChild(el));

  // 添加新图标
  document.head.appendChild(link);
  document.head.appendChild(legacyLink);
}
