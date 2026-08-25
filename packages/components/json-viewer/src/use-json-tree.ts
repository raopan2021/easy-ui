import type { JsonViewerProps } from './types'

import { computed, ref, watch } from 'vue'

/**
 * 收集数据中所有可展开节点的路径（与 JsonNode 的 path 生成规则保持一致）。
 *
 * @param data 节点数据
 * @param path 当前节点路径
 */
function collectAllPaths(data: unknown, path: string): string[] {
  const paths: string[] = []
  if (data === null || typeof data !== 'object')
    return paths
  if (Array.isArray(data) && data.length > 0) {
    paths.push(path)
    data.forEach((item, idx) => paths.push(...collectAllPaths(item, `${path}-${idx}`)))
  }
  else if (!Array.isArray(data)) {
    const keys = Object.keys(data)
    if (keys.length > 0) {
      paths.push(path)
      keys.forEach(key => paths.push(...collectAllPaths((data as Record<string, unknown>)[key], `${path}-${key}`)))
    }
  }
  return paths
}

/**
 * JSON 数据解析与展开 / 折叠状态管理。
 *
 * - 字符串数据尝试 JSON.parse，失败则按原始字符串展示；
 * - 以 expandedSet / collapsedSet 两个集合记录手动操作，未记录的节点按 depth 默认展开；
 * - data 变化时重置展开层级与手动操作记录。
 *
 * @param props 组件 props（data 与 depth）
 */
export function useJsonTree(props: Pick<JsonViewerProps, 'data' | 'depth'>) {
  /** 展开深度：0 表示全部展开 */
  const currentDepth = ref(props.depth ?? 3)

  /** 手动展开的路径 */
  const expandedSet = ref<Set<string>>(new Set())
  /** 手动折叠的路径 */
  const collapsedSet = ref<Set<string>>(new Set())

  /** 解析 JSON */
  const parsedData = computed(() => {
    if (props.data === undefined || props.data === null)
      return null
    if (typeof props.data === 'string') {
      try {
        return JSON.parse(props.data)
      }
      catch {
        return props.data
      }
    }
    return props.data
  })

  /** 展开全部 */
  function handleExpandAll() {
    collapsedSet.value = new Set()
    if (parsedData.value !== null) {
      const allPaths = collectAllPaths(parsedData.value, 'root')
      expandedSet.value = new Set(allPaths)
    }
  }

  /** 折叠全部 */
  function handleCollapseAll() {
    if (parsedData.value !== null) {
      const allPaths = collectAllPaths(parsedData.value, 'root')
      expandedSet.value = new Set()
      collapsedSet.value = new Set(allPaths)
    }
  }

  /**
   * 切换单个节点展开态。
   *
   * @param nodePath 节点路径
   * @param currentExpanded 该节点当前是否展开
   */
  function toggleNode(nodePath: string, currentExpanded: boolean) {
    if (currentExpanded) {
      expandedSet.value.delete(nodePath)
      collapsedSet.value.add(nodePath)
      expandedSet.value = new Set(expandedSet.value)
      collapsedSet.value = new Set(collapsedSet.value)
    }
    else {
      collapsedSet.value.delete(nodePath)
      expandedSet.value.add(nodePath)
      collapsedSet.value = new Set(collapsedSet.value)
      expandedSet.value = new Set(expandedSet.value)
    }
  }

  // 监听 data 变化
  watch(
    () => props.data,
    () => {
      currentDepth.value = props.depth ?? 3
      expandedSet.value = new Set()
      collapsedSet.value = new Set()
    },
  )

  return {
    currentDepth,
    expandedSet,
    collapsedSet,
    parsedData,
    handleExpandAll,
    handleCollapseAll,
    toggleNode,
  }
}
