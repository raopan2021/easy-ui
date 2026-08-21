/**
 * @description 创建层级关系（为已有嵌套树节点设置 id / parentId / pathList / uniqueId）
 * @param tree 嵌套树
 * @param pathList 当前层级路径
 * @returns 创建层级关系后的树
 */
export function buildHierarchyTree(tree: any[], pathList = []): any {
  if (!Array.isArray(tree)) {
    console.warn('tree must be an array')
    return []
  }
  if (!tree || tree.length === 0)
    return []
  for (const [key, node] of tree.entries()) {
    node.id = key
    node.parentId = pathList.length ? pathList[pathList.length - 1] : null
    node.pathList = [...pathList, node.id]
    const hasChildren = node.children && node.children.length > 0
    if (hasChildren) {
      buildHierarchyTree(node.children, node.pathList)
    }
  }
  return tree
}

/**
 * @description 构造树型结构数据（平铺列表 → 嵌套 children 格式）
 * @param data 数据源（平铺列表，每项含 id 和 parentId）
 * @param id id字段 默认id
 * @param parentId 父节点字段，默认parentId
 * @param children 子节点字段，默认children
 * @returns 嵌套树结构
 */
export function handleTree(data: any[], id?: string, parentId?: string, children?: string): any {
  if (!Array.isArray(data)) {
    console.warn('data must be an array')
    return []
  }
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children',
  }

  const childrenListMap: any = {}
  const nodeIds: any = {}
  const tree = []

  for (const d of data) {
    const pid = d[config.parentId]
    childrenListMap[pid] ??= []
    nodeIds[d[config.id]] = d
    childrenListMap[pid].push(d)
  }

  for (const d of data) {
    const pid = d[config.parentId]
    if (nodeIds[pid] == null) {
      tree.push(d)
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t)
  }

  function adaptToChildrenList(o: Record<string, any>) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]]
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c)
      }
    }
  }
  return tree
}
