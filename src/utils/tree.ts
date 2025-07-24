/**
 * 搜索树节点标题
 * @param root 树根节点
 * @param keyword 搜索关键字
 * @param field 被搜索字段
 * @returns 一个只包含匹配节点及其必要祖先的新树
 */
export function searchTree(root: Recordable, keyword: string, field = 'title') {
  // 辅助函数：深度优先搜索并构建新树
  const dfs = (node: Recordable) => {
    // 检查当前节点是否匹配（不区分大小写）
    const isMatch = (node[field] || '').toLowerCase().includes(keyword.toLowerCase());

    // 处理子节点（如果有）
    let matchedChildren = [];
    if (node.children) {
      matchedChildren = node.children
        .map((child: Recordable) => dfs(child)) // 递归处理子节点
        .filter((child: Recordable) => child !== null); // 过滤掉未匹配的子树
    }

    // 决定是否保留当前节点：
    // 1. 当前节点匹配关键字
    // 2. 或子节点有匹配项（需保留路径）
    if (isMatch || matchedChildren.length > 0) {
      // 创建新节点（浅拷贝，避免修改原节点）
      return {
        ...node,
        children: matchedChildren.length > 0 ? matchedChildren : undefined
      };
    }

    // 当前节点及其子树均无匹配
    return null;
  };

  // 从根节点开始搜索
  return dfs(root);
}

/**
 * 查找树节点路径
 * @param root 树根节点
 * @param targetField 目标值key
 * @param targetValue 目标值
 */
export function findTreeNodePath(root: any, targetField: string, targetValue: any) {
  const path: any[] = [];
  if (!root) return path;

  const traverse = (node: any) => {
    path.push(node);
    if (node[targetField] === targetValue) return true;
    for (const child of node.children) {
      if (traverse(child)) return true;
    }
    path.pop();
    return false;
  };

  traverse(root);
  return path;
}

/**
 * 查找树节点
 * @param root 树根节点
 * @param predicate 判断函数
 */
export function findTreeNode(root: any, predicate: Function): any {
  const nodes = Array.isArray(root) ? root : [root];
  for (const node of nodes) {
    if (predicate(node)) {
      return node;
    }
    if (node.children && Array.isArray(node.children)) {
      const found = findTreeNode(node.children, predicate);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
