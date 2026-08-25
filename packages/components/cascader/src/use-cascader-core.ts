/* eslint-disable ts/no-use-before-define */
import type { CascaderEmits, CascaderNode, CascaderProps } from './types'

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * EasyCascader 核心逻辑 composable
 *
 * 将原本内联在 cascader.vue 中的全部状态、计算属性、菜单交互、搜索、
 * 面板定位、外部事件与生命周期抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 级联选择器 props（需传入响应式对象，computed/watch 自动追踪依赖）
 * @param emit  级联选择器事件触发函数（callable 形式，见 CascaderEmits）
 */
export function useCascaderCore(props: CascaderProps, emit: CascaderEmits) {
  // ========== 内部状态 ==========
  const triggerRef = ref<HTMLElement | null>(null)
  const panelRef = ref<HTMLElement | null>(null)
  const searchRef = ref<HTMLInputElement | null>(null)
  const panelHeight = ref(300)
  const tagsContainerRef = ref<HTMLElement | null>(null)
  const tagRefs = ref<(HTMLElement | null)[]>([])
  const panelVisible = ref(false)
  const hovering = ref(false)
  const tick = ref(0)
  const searchQuery = ref('')
  const remoteOptions = ref<CascaderNode[]>([])
  const visibleLabelCount = ref(0)
  const hiddenCount = computed(() => Math.max(0, selectedLabels.value.length - visibleLabelCount.value))

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let calcTimeout: ReturnType<typeof setTimeout> | null = null

  /** 活跃的菜单列表（每级一个数组） */
  const activeMenus = ref<CascaderNode[][]>([])

  /** 当前展开的路径节点（用于高亮） */
  const activePathNodes = ref<CascaderNode[]>([])

  /** 搜索结果 */
  const searchResults = ref<{ path: (string | number)[], pathLabels: string[] }[]>([])

  // ========== 工具函数 ==========

  function getNodeKey(node: CascaderNode) {
    return `${node[props.valueKey ?? 'value']}_${node[props.labelKey ?? 'label']}`
  }

  /** 获取菜单节点自定义类名 */
  function getMenuNodeClass(node: CascaderNode, level: number): string {
    if (typeof props.menuNodeClass === 'function') {
      return props.menuNodeClass(node, level)
    }
    return props.menuNodeClass || ''
  }

  /** 获取菜单节点自定义样式 */
  function getMenuNodeStyle(node: CascaderNode, level: number): string {
    if (typeof props.menuNodeStyle === 'function') {
      return props.menuNodeStyle(node, level)
    }
    return props.menuNodeStyle || ''
  }

  /** 设置标签引用 */
  function setTagRef(el: any, index: number) {
    if (el) {
      tagRefs.value[index] = el
    }
  }

  /** 计算可见标签数量（延迟到 DOM 更新后，避免闪烁） */
  function calculateVisibleLabels() {
    // 清除之前的计算定时器
    if (calcTimeout) {
      clearTimeout(calcTimeout)
    }

    // 延迟计算，等待 DOM 更新完成
    calcTimeout = setTimeout(() => {
      if (!tagsContainerRef.value || selectedLabels.value.length === 0) {
        visibleLabelCount.value = selectedLabels.value.length
        return
      }

      const container = tagsContainerRef.value
      const containerWidth = container.clientWidth
      const paddingLeft = Number.parseFloat(getComputedStyle(container).paddingLeft)
      const paddingRight = Number.parseFloat(getComputedStyle(container).paddingRight)
      const availableWidth = containerWidth - paddingLeft - paddingRight - 20 // 20px for suffix space

      let totalWidth = 0
      let count = 0
      let hasUnrenderedTag = false

      for (let i = 0; i < selectedLabels.value.length; i++) {
        const tag = tagRefs.value[i]
        if (!tag) {
          // 标签未渲染，暂时显示全部
          hasUnrenderedTag = true
          break
        }

        const tagWidth = tag.offsetWidth

        // 计算是否需要显示 +N 标签
        const remaining = selectedLabels.value.length - i - 1
        const needsCountTag = remaining > 0
        const countTagWidth = needsCountTag ? 30 : 0 // 估算 +N 标签宽度

        if (totalWidth + tagWidth + countTagWidth > availableWidth) {
          break
        }

        totalWidth += tagWidth + 4 // 4px 是 gap
        count++
      }

      // 如果有未渲染的标签，暂时显示全部
      if (hasUnrenderedTag) {
        visibleLabelCount.value = selectedLabels.value.length
      }
      else {
        // 确保至少显示一个标签
        visibleLabelCount.value = Math.max(1, count)
      }
    }, 0)
  }

  function getNodeChildren(node: CascaderNode): CascaderNode[] {
    const children = node[props.childrenKey ?? 'children']
    if (children && children.length > 0)
      return children
    return []
  }

  function isLeaf(node: CascaderNode): boolean {
    // 明确标记为叶子节点
    if (node.leaf === true)
      return true
    const children = node[props.childrenKey ?? 'children']
    // 没有子节点且已经加载过
    if (node._loaded === true && (!children || children.length === 0))
      return true
    // 有子节点
    if (children && children.length > 0)
      return false
    // 懒加载模式
    if (props.lazyLoad)
      return false
    // 没有懒加载且没有 children，视为叶子
    return true
  }

  // ========== 初始化菜单 ==========

  function initMenus() {
    activeMenus.value = [props.options ?? []]
    activePathNodes.value = []
  }

  // ========== 路径相关 ==========

  function getActivePath(): (string | number)[] {
    return activePathNodes.value.map(n => n[props.valueKey ?? 'value'])
  }

  function isNodeInActivePath(node: CascaderNode, level: number): boolean {
    return activePathNodes.value[level]?.[props.valueKey ?? 'value'] === node[props.valueKey ?? 'value']
  }

  // ========== 选中状态 ==========

  /** 将 modelValue 转换为二维数组（内部统一使用二维数组处理） */
  const internalValue = computed<(string | number)[][]>(() => {
    if (!props.multiple) {
      const val = props.modelValue as (string | number)[]
      if (Array.isArray(val) && val.length > 0)
        return [val]
      return []
    }

    const val = props.modelValue
    if (Array.isArray(val) && val.length > 0) {
      // 已经是二维数组
      if (Array.isArray(val[0]))
        return val as (string | number)[][]
      // 是一维数组，包装成二维数组（单选值）
      return [val as (string | number)[]]
    }
    if (typeof val === 'string' && val.trim() !== '') {
      // 是字符串，按分隔符拆分
      return val.split(props.separator ?? ',').map((v) => {
        // 每个路径项可能包含多级，用另一个分隔符拆分（默认斜杠）
        return v.split('/').map(item => item.trim())
      })
    }
    return []
  })

  /** 将内部二维数组转换为 modelValue（根据 valueType） */
  function formatModelValue(arr: (string | number)[][]): any {
    if (!props.multiple) {
      return arr[0] || []
    }

    if (props.valueType === 'string') {
      return arr.map(path => path.join('/')).join(props.separator ?? ',')
    }
    return arr
  }

  const selectedValues = computed<(string | number)[][]>(() => {
    return internalValue.value
  })

  function isNodeChecked(node: CascaderNode): boolean {
    // 获取从根节点到当前节点的完整路径
    const nodePath = getNodePath(node)
    return selectedValues.value.some(v => JSON.stringify(v) === JSON.stringify(nodePath))
  }

  /** 获取节点到根节点的完整路径 */
  function getNodePath(targetNode: CascaderNode): (string | number)[] {
    const path: (string | number)[] = []

    // 递归查找节点路径
    function findPath(nodes: CascaderNode[], target: CascaderNode, currentPath: (string | number)[]): boolean {
      for (const node of nodes) {
        const nodeValue = node[props.valueKey ?? 'value']
        const newPath = [...currentPath, nodeValue]

        if (nodeValue === target[props.valueKey ?? 'value']) {
          path.push(...newPath)
          return true
        }

        const children = getNodeChildren(node)
        if (children.length > 0 && findPath(children, target, newPath)) {
          return true
        }
      }
      return false
    }

    findPath(props.options ?? [], targetNode, [])
    return path
  }

  function isSearchResultSelected(path: (string | number)[]): boolean {
    return selectedValues.value.some(v => JSON.stringify(v) === JSON.stringify(path))
  }

  // ========== 显示 ==========

  const hasValue = computed(() => {
    if (props.multiple) {
      const val = props.modelValue
      if (Array.isArray(val))
        return val.length > 0
      if (typeof val === 'string')
        return val.trim() !== ''
      return false
    }
    const val = props.modelValue as (string | number)[]
    return Array.isArray(val) && val.length > 0
  })

  function findNodeByPath(path: (string | number)[]): string {
    const labels: string[] = []
    let nodes = props.options ?? []
    for (const val of path) {
      const node = nodes.find(n => n[props.valueKey ?? 'value'] === val)
      if (!node)
        break
      labels.push(node[props.labelKey ?? 'label'] as string)
      nodes = (node[props.childrenKey ?? 'children'] as CascaderNode[]) || []
    }
    return labels.join(' / ')
  }

  const selectedLabels = computed<string[]>(() => {
    if (props.multiple) {
      return internalValue.value.map(path => findNodeByPath(path))
    }
    const val = internalValue.value[0]
    if (val && val.length > 0)
      return [findNodeByPath(val)]
    return []
  })

  const displayLabel = computed(() => {
    if (selectedLabels.value.length > 0)
      return selectedLabels.value.join(', ')
    return ''
  })

  const visibleLabels = computed(() => {
    return selectedLabels.value.slice(0, visibleLabelCount.value)
  })

  // ========== 面板定位 ==========

  const panelStyle = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    tick.value
    if (!triggerRef.value)
      return {}
    const rect = triggerRef.value.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const ph = panelHeight.value
    if (spaceBelow < ph) {
      return {
        top: `${Math.max(4, rect.top - ph - 4)}px`,
        left: `${rect.left}px`,
        minWidth: `${rect.width}px`,
      }
    }
    return {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      minWidth: `${rect.width}px`,
    }
  })

  // ========== 展开/收起 ==========

  function togglePanel() {
    if (props.disabled)
      return
    panelVisible.value = !panelVisible.value
    if (panelVisible.value) {
      tick.value++
      initMenus()
      // 恢复选中状态对应的展开路径
      restoreExpandedPath()
      nextTick(() => {
        if (panelRef.value) {
          panelHeight.value = panelRef.value.offsetHeight
          tick.value++
        }
        if (props.filterable)
          searchRef.value?.focus()
      })
    }
    else {
      searchQuery.value = ''
      searchResults.value = []
    }
  }

  function restoreExpandedPath() {
    const firstPath = internalValue.value[0]
    if (!firstPath || !firstPath.length)
      return

    let nodes = props.options ?? []
    const pathNodes: CascaderNode[] = []

    for (const val of firstPath) {
      const node = nodes.find(n => n[props.valueKey ?? 'value'] === val)
      if (!node)
        break
      pathNodes.push(node)
      const children = node[props.childrenKey ?? 'children'] as CascaderNode[]
      if (children && children.length > 0) {
        nodes = children
        activeMenus.value.push(children)
      }
      else {
        break
      }
    }

    activePathNodes.value = pathNodes
  }

  // ========== 菜单交互 ==========

  function handleCheckboxClick(node: CascaderNode, level: number) {
    if (node.disabled || node._loading)
      return

    // 勾选时不更新激活路径，只处理选中状态
    if (props.multiple) {
      handleMultipleSelect(node, level)
    }
    else {
      handleSingleSelect(node, level)
    }
  }

  function handleNodeClick(node: CascaderNode, level: number) {
    if (node.disabled || node._loading)
      return

    // 更新当前层级的激活节点
    activePathNodes.value = [...activePathNodes.value.slice(0, level), node]

    // 只展开下一级菜单，不选择
    const nodeHasChildren = getNodeChildren(node).length > 0 || (!node._loaded && props.lazyLoad)

    if (nodeHasChildren) {
      activeMenus.value = activeMenus.value.slice(0, level + 1)

      if (getNodeChildren(node).length > 0) {
        activeMenus.value.push(getNodeChildren(node))
        const path = getActivePath()
        emit('expand-change', path)
      }
      else if (!node._loaded && props.lazyLoad) {
        loadChildren(node)
      }
    }
  }

  /** 单选模式：点击文本同时处理展开和选择 */
  function handleNodeClickAndSelect(node: CascaderNode, level: number) {
    if (node.disabled || node._loading)
      return

    // 更新当前层级的激活节点
    activePathNodes.value = [...activePathNodes.value.slice(0, level), node]

    const nodeHasChildren = getNodeChildren(node).length > 0 || (!node._loaded && props.lazyLoad)

    // checkStrictly 模式或叶子节点：选中当前节点
    if (props.checkStrictly || !nodeHasChildren) {
      const nodePath = getNodePath(node)
      emit('update:modelValue', nodePath)
      emit('change', nodePath)
      if (!nodeHasChildren) {
        panelVisible.value = false
      }
    }

    // 如果有子节点，展开下一级菜单
    if (nodeHasChildren) {
      activeMenus.value = activeMenus.value.slice(0, level + 1)

      if (getNodeChildren(node).length > 0) {
        activeMenus.value.push(getNodeChildren(node))
        const nodePath = getNodePath(node)
        emit('expand-change', nodePath)
      }
      else if (!node._loaded && props.lazyLoad) {
        loadChildren(node)
      }
    }
  }

  function handleNodeHover(node: CascaderNode, level: number) {
    if (props.expandTrigger !== 'hover')
      return
    if (node.disabled || node._loading)
      return
    if (isLeaf(node))
      return

    activePathNodes.value = [...activePathNodes.value.slice(0, level), node]
    activeMenus.value = activeMenus.value.slice(0, level + 1)
    activeMenus.value.push(getNodeChildren(node))

    // 懒加载
    if (getNodeChildren(node).length === 0 && !node._loaded && props.lazyLoad) {
      loadChildren(node)
    }
  }

  function handleSingleSelect(node: CascaderNode, _level: number) {
    const nodePath = getNodePath(node)
    const nodeHasChildren = getNodeChildren(node).length > 0 || (!node._loaded && props.lazyLoad)

    // checkStrictly 模式或叶子节点：选中当前节点
    if (props.checkStrictly || !nodeHasChildren) {
      emit('update:modelValue', formatModelValue([nodePath]))
      emit('change', formatModelValue([nodePath]))
      if (!nodeHasChildren) {
        panelVisible.value = false
      }
    }
    else {
      // 非叶子节点且非 checkStrictly 模式：只选中，不关闭面板
      emit('update:modelValue', formatModelValue([nodePath]))
      emit('change', formatModelValue([nodePath]))
    }
  }

  function handleMultipleSelect(node: CascaderNode, level: number) {
    const nodePath = getNodePath(node)
    const nodeHasChildren = getNodeChildren(node).length > 0 || (!node._loaded && props.lazyLoad)

    const current = [...internalValue.value]
    const idx = current.findIndex(v => JSON.stringify(v) === JSON.stringify(nodePath))

    if (idx > -1) {
      current.splice(idx, 1)
    }
    else {
      current.push(nodePath)
    }

    emit('update:modelValue', formatModelValue(current))
    emit('change', formatModelValue(current))

    // 非叶子节点：展开下一级菜单
    if (nodeHasChildren) {
      activeMenus.value = activeMenus.value.slice(0, level + 1)

      if (getNodeChildren(node).length > 0) {
        activeMenus.value.push(getNodeChildren(node))
        emit('expand-change', nodePath)
      }
      else if (!node._loaded && props.lazyLoad) {
        loadChildren(node)
      }
    }
  }

  function loadChildren(node: CascaderNode) {
    if (!props.lazyLoad || node._loading)
      return
    node._loading = true

    props.lazyLoad(node, (children: CascaderNode[]) => {
      node._loading = false
      node._loaded = true
      node[props.childrenKey ?? 'children'] = children
      // 更新菜单
      const level = activePathNodes.value.length - 1
      activeMenus.value = activeMenus.value.slice(0, level + 1)
      activeMenus.value.push(children)
    })
  }

  // ========== 搜索 ==========

  function flattenNodes(
    nodes: CascaderNode[],
    parentPath: (string | number)[] = [],
    parentLabels: string[] = [],
  ): { path: (string | number)[], pathLabels: string[] }[] {
    const results: { path: (string | number)[], pathLabels: string[] }[] = []

    for (const node of nodes) {
      const currentPath = [...parentPath, node[props.valueKey ?? 'value']]
      const currentLabels = [...parentLabels, node[props.labelKey ?? 'label']]
      const children = getNodeChildren(node)

      if (isLeaf(node) || children.length === 0) {
        results.push({ path: currentPath, pathLabels: currentLabels })
      }
      else {
        results.push(...flattenNodes(children, currentPath, currentLabels))
      }
    }

    return results
  }

  function handleSearch() {
    if (!searchQuery.value) {
      searchResults.value = []
      return
    }
    // 远程搜索模式
    if (props.remote && props.remoteMethod) {
      if (debounceTimer)
        clearTimeout(debounceTimer)
      const remoteMethod = props.remoteMethod
      debounceTimer = setTimeout(() => {
        remoteMethod?.(searchQuery.value)
        emit('search', searchQuery.value)
      }, props.debounce)
      return
    }
    // 本地搜索模式
    const q = searchQuery.value.toLowerCase()
    const all = flattenNodes(props.options ?? [])
    searchResults.value = all.filter(item => item.pathLabels.some(label => label.toLowerCase().includes(q)))
  }

  function selectSearchResult(result: { path: (string | number)[], pathLabels: string[] }) {
    if (props.multiple) {
      const current = [...internalValue.value]
      const idx = current.findIndex(v => JSON.stringify(v) === JSON.stringify(result.path))
      if (idx > -1) {
        current.splice(idx, 1)
      }
      else {
        current.push(result.path)
      }
      emit('update:modelValue', formatModelValue(current))
      emit('change', formatModelValue(current))
    }
    else {
      emit('update:modelValue', formatModelValue([result.path]))
      emit('change', formatModelValue([result.path]))
      panelVisible.value = false
    }
  }

  // ========== 清除 ==========

  function clear() {
    const val = props.multiple ? formatModelValue([]) : []
    emit('update:modelValue', val)
    emit('change', val)
  }

  function removeSelected(visibleIndex: number) {
    const current = [...internalValue.value]
    // visibleIndex 是 visibleLabels 中的索引，需要找到对应的原始值
    const visibleLabelValue = visibleLabels.value[visibleIndex]
    const originalIndex = current.findIndex((path) => {
      return findNodeByPath(path) === visibleLabelValue
    })

    if (originalIndex > -1) {
      current.splice(originalIndex, 1)
      emit('update:modelValue', formatModelValue(current))
      emit('change', formatModelValue(current))
    }
  }

  // ========== 外部事件 ==========

  function handleClickOutside(e: MouseEvent) {
    if (!panelVisible.value)
      return
    const target = e.target as HTMLElement
    if (triggerRef.value?.contains(target))
      return
    if (panelRef.value?.contains(target))
      return
    panelVisible.value = false
    searchQuery.value = ''
    searchResults.value = []
  }

  function handleScrollClose(e: Event) {
    if (!panelVisible.value)
      return
    const target = e.target as HTMLElement
    if (panelRef.value?.contains(target))
      return
    panelVisible.value = false
    searchQuery.value = ''
    searchResults.value = []
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScrollClose, true)
  })

  watch(
    () => [selectedLabels.value, panelVisible.value],
    () => {
      nextTick(() => {
        calculateVisibleLabels()
      })
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
    window.removeEventListener('scroll', handleScrollClose, true)
    if (calcTimeout) {
      clearTimeout(calcTimeout)
    }
  })

  // ========== 暴露方法 ==========

  /** 关闭下拉面板 */
  function blur() {
    panelVisible.value = false
  }

  return {
    // 状态
    triggerRef,
    panelRef,
    searchRef,
    panelHeight,
    tagsContainerRef,
    tagRefs,
    panelVisible,
    hovering,
    tick,
    searchQuery,
    remoteOptions,
    visibleLabelCount,
    hiddenCount,
    activeMenus,
    activePathNodes,
    searchResults,
    // 计算属性
    selectedLabels,
    displayLabel,
    visibleLabels,
    panelStyle,
    hasValue,
    internalValue,
    selectedValues,
    // 工具函数
    getNodeKey,
    getMenuNodeClass,
    getMenuNodeStyle,
    setTagRef,
    calculateVisibleLabels,
    getNodeChildren,
    isLeaf,
    getActivePath,
    isNodeInActivePath,
    getNodePath,
    isNodeChecked,
    isSearchResultSelected,
    findNodeByPath,
    formatModelValue,
    // 交互
    togglePanel,
    restoreExpandedPath,
    handleCheckboxClick,
    handleNodeClick,
    handleNodeClickAndSelect,
    handleNodeHover,
    handleSingleSelect,
    handleMultipleSelect,
    loadChildren,
    flattenNodes,
    handleSearch,
    selectSearchResult,
    clear,
    removeSelected,
    handleClickOutside,
    handleScrollClose,
    blur,
  }
}
