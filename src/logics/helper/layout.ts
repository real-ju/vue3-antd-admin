import type { MenuTree, MenuItem } from '/#/store';

import { router } from '/@/router';

/**
 * 查找等于key值的节点的路径
 * @returns {
 *  menuKeyPath: string[],
 *  menuNodePath: Recordable[]
 * }
 */
export function generateMenuPath(
  menuTree: MenuTree,
  key: string
): { menuKeyPath: string[]; menuNodePath: Recordable[] } {
  let menuKeyPath: string[] = [];
  let menuNodePath: Recordable[] = [];

  const generate = (menuTree: MenuTree, key: string): true | undefined => {
    for (let index = 0; index < menuTree.length; index++) {
      const menuNode = menuTree[index];
      menuKeyPath.push(menuNode.key);
      menuNodePath.push(menuNode);
      if (menuNode.key === key) {
        return true;
      }
      if (menuNode.children) {
        const rst = generate(menuNode.children, key);
        if (rst) {
          return rst;
        }
      }
      menuKeyPath.pop();
      menuNodePath.pop();
    }
  };

  generate(menuTree, key);

  return { menuKeyPath, menuNodePath };
}

/**
 * 根据keyPath查找菜单节点
 */
export function getMenuNodeFromKeyPath(menuTree: MenuTree, keyPath: string[]): MenuItem | null {
  if (keyPath.length === 0) {
    return null;
  }

  let currentMenuTree = menuTree;
  let rstNode;

  for (let index = 0; index < keyPath.length; index++) {
    const key = keyPath[index];
    const treeNode = currentMenuTree.find((item) => {
      return item.key === key;
    });
    if (index < keyPath.length - 1) {
      currentMenuTree = treeNode!.children!;
    } else {
      rstNode = treeNode;
    }
  }
  return rstNode || null;
}

/**
 * 获取菜单树第一个叶子节点
 */
export function getMenuFirstLeafNode(menuTree: MenuTree): MenuItem | null {
  let currentNode: any = { children: menuTree };
  while (currentNode.children) {
    if (currentNode.children.length === 0) {
      return null;
    }
    currentNode = currentNode.children[0];
  }
  return currentNode;
}

/**
 * 跳转到菜单树第一个叶子节点
 */
export function goMenuFirstLeafNode(menuTree: MenuTree) {
  const node = getMenuFirstLeafNode(menuTree);
  if (node) {
    handleGoFromMenuNode(node);
  }
}

/**
 * 根据菜单节点跳转路由
 */
export function handleGoFromMenuNode(node: MenuItem) {
  if (node.url) {
    router.push(node.url);
  }
}

/**
 * 根据菜单节点路径跳转路由
 */
export const handleGoFromMenuKeyPath = (menuTree: MenuTree, keyPath: string[]) => {
  const node = getMenuNodeFromKeyPath(menuTree, keyPath);
  if (node && node.url) {
    router.push(node.url);
  }
};
