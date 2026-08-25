import type { TreeChartEmits, TreeChartProps, TreeChatNode } from './types'

import { useDark } from '@vueuse/core'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

/** 连接线类型（内部使用） */
interface ConnectionLine {
  id: string
  path: string
  color: string
}

/**
 * 树图（思维导图）核心逻辑：缩放/平移、展开状态、连接线绘制、生命周期绑定。
 *
 * 将原本内联在 tree-chart.vue 中的大量状态、计算属性与事件方法抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 响应式 props（需传入 withDefaults 后的对象）
 * @param emit   组件 emit 函数（callable 形式的 TreeChartEmits）
 */
export function useTreeChart(props: TreeChartProps, emit: TreeChartEmits) {
  // ========== 响应式状态 ==========
  const containerRef = ref<HTMLElement | null>(null)
  const canvasWrapperRef = ref<HTMLElement | null>(null)
  const canvasRef = ref<HTMLElement | null>(null)
  const linesSvgRef = ref<SVGSVGElement | null>(null)

  // 缩放和平移
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)

  // 画布尺寸
  const canvasWidth = ref(2000)
  const canvasHeight = ref(2000)

  // 内部布局状态
  const internalLayout = ref<'horizontal' | 'vertical'>(
    props.layout ? (props.layout === 'horizontal' ? 'vertical' : 'horizontal') : 'horizontal',
  )

  // 拖拽状态
  const isPanning = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const startTranslateX = ref(0)
  const startTranslateY = ref(0)

  // 内部展开状态
  const internalExpandedKeys = ref<Set<string | number>>(new Set())

  // 连接线
  const connectionLines = ref<ConnectionLine[]>([])

  // ========== 计算属性 ==========
  // 是否多棵树模式
  const hasMultipleTrees = computed(() => {
    return props.trees !== null && Array.isArray(props.trees) && props.trees.length > 0
  })

  // 获取当前数据（多棵树或单棵树）
  const currentData = computed(() => {
    if (hasMultipleTrees.value) {
      // 多棵树模式：合并所有树的数据用于判断空状态
      return (props.trees ?? []).flat()
    }
    return props.data
  })

  const isEmpty = computed(() => !currentData.value || currentData.value.length === 0)

  const canvasStyle = computed(() => ({
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
    transformOrigin: '0 0',
  }))

  // 画布容器背景样式（自动跟随 dark 模式）
  const isDarkTree = useDark()
  const canvasWrapperStyle = computed(() => {
    const bg = props.backgroundColor === '#ffffff' ? (isDarkTree.value ? '#1a1a1a' : '#ffffff') : props.backgroundColor
    const style: Record<string, string> = { backgroundColor: bg ?? '#ffffff' }
    if (props.showGrid) {
      const gc = props.gridColor === '#f1f2f5' ? (isDarkTree.value ? '#2a2a2a' : '#f1f2f5') : props.gridColor
      style.backgroundImage = `linear-gradient(${gc} 1px, transparent 1px), linear-gradient(90deg, ${gc} 1px, transparent 1px)`
      style.backgroundSize = '20px 20px'
      style.backgroundPosition = 'center center'
    }
    return style
  })

  const mergedNodeConfig = computed(() => ({
    nodeWidth: props.nodeConfig?.nodeWidth ?? 160,
    nodeMinHeight: props.nodeConfig?.nodeMinHeight ?? 48,
    horizontalGap: props.nodeConfig?.horizontalGap ?? 60,
    verticalGap: props.nodeConfig?.verticalGap ?? 24,
    lineColor: props.nodeConfig?.lineColor ?? (isDarkTree.value ? '#555' : '#94a3b8'),
    lineWidth: props.nodeConfig?.lineWidth ?? 1.5,
    keyField: props.nodeConfig?.keyField ?? 'id',
    childrenField: props.nodeConfig?.childrenField ?? 'children',
    titleField: props.nodeConfig?.titleField ?? 'label',
    descField: props.nodeConfig?.descField ?? 'desc',
    avatarField: props.nodeConfig?.avatarField ?? 'avatar',
  }))

  // 获取当前展开状态
  const currentExpandedKeys = computed(() => {
    // 如果外部传入了 expandedKeys（非 null），使用外部状态（受控模式）
    if (props.expandedKeys !== null && props.expandedKeys !== undefined) {
      return new Set(props.expandedKeys)
    }
    // 否则使用内部状态（非受控模式）
    return internalExpandedKeys.value
  })

  // ========== 方法 ==========
  function getNodeKey(node: TreeChatNode, index: number, prefix?: string): string {
    const base = String(node.id ?? `node-${index}`)
    return prefix ? `${prefix}-${base}` : base
  }

  function setLayout(newLayout: 'horizontal' | 'vertical') {
    internalLayout.value = newLayout
    resetView()
    nextTick(() => updateConnectionLines())
  }

  function zoomIn() {
    const newScale = Math.min(props.maxScale ?? 3, scale.value * 1.2)
    scale.value = Math.round(newScale * 100) / 100
  }

  function zoomOut() {
    const newScale = Math.max(props.minScale ?? 0.3, scale.value / 1.2)
    scale.value = Math.round(newScale * 100) / 100
  }

  function resetView() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }

  function onWheel(e: WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      // Mac 上是 ctrlKey 或 metaKey
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(props.minScale ?? 0.3, Math.min(props.maxScale ?? 3, scale.value * delta))
      scale.value = Math.round(newScale * 100) / 100
    }
    else {
      // 普通滚动，平移画布
      translateX.value -= e.deltaX || 0
      translateY.value -= e.deltaY || 0
    }
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      isPanning.value = true
      startX.value = e.clientX
      startY.value = e.clientY
      startTranslateX.value = translateX.value
      startTranslateY.value = translateY.value
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (isPanning.value) {
      const dx = e.clientX - startX.value
      const dy = e.clientY - startY.value
      translateX.value = startTranslateX.value + dx
      translateY.value = startTranslateY.value + dy
    }
  }

  function onMouseUp() {
    isPanning.value = false
  }

  function handleNodeClick(node: TreeChatNode, nodePath: TreeChatNode[] = [node]) {
    emit('node-click', node, nodePath)
  }

  function handleToggleExpand(node: TreeChatNode, expanded: boolean) {
    emit('toggle-expand', node, expanded)

    const key = node.id
    const newKeys = new Set(currentExpandedKeys.value)

    if (expanded) {
      newKeys.add(key)
    }
    else {
      newKeys.delete(key)
    }

    // 如果是受控模式，通过 emit 更新
    if (props.expandedKeys !== null && props.expandedKeys !== undefined) {
      emit('update:expandedKeys', Array.from(newKeys))
    }
    else {
      internalExpandedKeys.value = newKeys
    }

    // 延迟更新连接线，等待 DOM 完全渲染
    nextTick(() => {
      requestAnimationFrame(() => {
        setTimeout(updateConnectionLines, 50)
      })
    })
  }

  // 更新连接线
  function updateConnectionLines() {
    if (!canvasRef.value)
      return

    const lines: ConnectionLine[] = []
    const canvas = canvasRef.value
    const canvasRect = canvas.getBoundingClientRect()
    const lineColor = mergedNodeConfig.value.lineColor || '#94a3b8'

    // 更新画布尺寸
    const rootEl = canvas.querySelector('.easy-tree-Chart__root') as HTMLElement
    if (rootEl) {
      const rootRect = rootEl.getBoundingClientRect()
      canvasWidth.value = Math.max(2000, rootRect.width + 80)
      canvasHeight.value = Math.max(2000, rootRect.height + 80)
    }

    // 递归收集所有父子关系
    const collectConnections = (wrapper: Element, _parentRect?: DOMRect) => {
      const treeNode = wrapper.querySelector('.tree-node') as HTMLElement

      if (!treeNode)
        return

      const nodeRect = treeNode.getBoundingClientRect()

      // 获取子节点容器
      const childrenContainer = wrapper.querySelector('.tree-children') as HTMLElement

      // 计算相对于画布的坐标
      const nodeLeft = nodeRect.left - canvasRect.left
      const nodeTop = nodeRect.top - canvasRect.top
      const nodeRight = nodeLeft + nodeRect.width
      const nodeBottom = nodeTop + nodeRect.height
      const nodeCenterX = nodeLeft + nodeRect.width / 2
      const nodeCenterY = nodeTop + nodeRect.height / 2

      // 获取子节点包装器
      const childWrappers = childrenContainer?.querySelectorAll(':scope > .tree-node-wrapper') || []

      if (childWrappers.length > 0 && internalLayout.value === 'vertical') {
        // 竖向布局
        const startX = nodeCenterX
        const startY = nodeBottom

        // 获取所有子节点位置
        const childPositions: { x: number, y: number, centerX: number }[] = []
        childWrappers.forEach((childWrapper) => {
          const childNode = childWrapper.querySelector('.tree-node') as HTMLElement
          if (childNode) {
            const childRect = childNode.getBoundingClientRect()
            childPositions.push({
              x: childRect.left - canvasRect.left,
              y: childRect.top - canvasRect.top,
              centerX: childRect.left - canvasRect.left + childRect.width / 2,
            })
          }
        })

        if (childPositions.length === 1) {
          // 单个子节点：直接画 L 形线
          const child = childPositions[0]
          const midY = startY + 18
          lines.push({
            id: `line-${wrapper.getAttribute('data-key') || Math.random()}`,
            path: `M ${startX} ${startY} L ${startX} ${midY} L ${child.centerX} ${midY} L ${child.centerX} ${child.y}`,
            color: lineColor,
          })
        }
        else if (childPositions.length > 1) {
          // 多个子节点
          const firstChild = childPositions[0]
          const lastChild = childPositions[childPositions.length - 1]
          const midY = startY + 18

          // 从父节点到中间水平线
          lines.push({
            id: `line-v-${wrapper.getAttribute('data-key') || Math.random()}`,
            path: `M ${startX} ${startY} L ${startX} ${midY}`,
            color: lineColor,
          })

          // 水平线连接所有子节点
          lines.push({
            id: `line-h-${wrapper.getAttribute('data-key') || Math.random()}`,
            path: `M ${firstChild.centerX} ${midY} L ${lastChild.centerX} ${midY}`,
            color: lineColor,
          })

          // 每个子节点的垂直线
          childPositions.forEach((child, idx) => {
            lines.push({
              id: `line-child-${wrapper.getAttribute('data-key') || Math.random()}-${idx}`,
              path: `M ${child.centerX} ${midY} L ${child.centerX} ${child.y}`,
              color: lineColor,
            })
          })
        }

        // 递归处理子节点
        childWrappers.forEach((childWrapper) => {
          collectConnections(childWrapper, nodeRect)
        })
      }
      else if (childWrappers.length > 0 && internalLayout.value === 'horizontal') {
        // 水平布局
        const startX = nodeRight
        const startY = nodeCenterY

        // 获取所有子节点位置
        const childPositions: { x: number, y: number, centerY: number }[] = []
        childWrappers.forEach((childWrapper) => {
          const childNode = childWrapper.querySelector('.tree-node') as HTMLElement
          if (childNode) {
            const childRect = childNode.getBoundingClientRect()
            childPositions.push({
              x: childRect.left - canvasRect.left,
              y: childRect.top - canvasRect.top,
              centerY: childRect.top - canvasRect.top + childRect.height / 2,
            })
          }
        })

        if (childPositions.length === 1) {
          // 单个子节点
          const child = childPositions[0]
          const midX = startX + 25
          lines.push({
            id: `line-${wrapper.getAttribute('data-key') || Math.random()}`,
            path: `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${child.centerY} L ${child.x} ${child.centerY}`,
            color: lineColor,
          })
        }
        else if (childPositions.length > 1) {
          // 多个子节点
          const firstChild = childPositions[0]
          const lastChild = childPositions[childPositions.length - 1]
          const midX = startX + 25

          // 从父节点到中间垂直线
          lines.push({
            id: `line-h-${wrapper.getAttribute('data-key') || Math.random()}`,
            path: `M ${startX} ${startY} L ${midX} ${startY}`,
            color: lineColor,
          })

          // 垂直线连接所有子节点
          lines.push({
            id: `line-v-${wrapper.getAttribute('data-key') || Math.random()}`,
            path: `M ${midX} ${firstChild.centerY} L ${midX} ${lastChild.centerY}`,
            color: lineColor,
          })

          // 每个子节点的水平线
          childPositions.forEach((child, idx) => {
            lines.push({
              id: `line-child-${wrapper.getAttribute('data-key') || Math.random()}-${idx}`,
              path: `M ${midX} ${child.centerY} L ${child.x} ${child.centerY}`,
              color: lineColor,
            })
          })
        }

        // 递归处理子节点
        childWrappers.forEach((childWrapper) => {
          collectConnections(childWrapper, nodeRect)
        })
      }
    }

    // 从根节点开始收集（支持多棵树和单棵树模式）
    const rootWrappers = canvas.querySelectorAll('.easy-tree-Chart__root > .tree-node-wrapper')
    rootWrappers.forEach((wrapper) => {
      collectConnections(wrapper)
    })

    // 多棵树模式下，也收集每棵树内部的连接线
    if (hasMultipleTrees.value) {
      const treeWrappers = canvas.querySelectorAll('.easy-tree-Chart__tree-wrapper')
      treeWrappers.forEach((treeWrapper) => {
        const wrappers = treeWrapper.querySelectorAll('.tree-node-wrapper')
        wrappers.forEach((wrapper) => {
          collectConnections(wrapper)
        })
      })
    }

    connectionLines.value = lines
  }

  // ========== 生命周期 ==========
  onMounted(() => {
    // 初始化时展开所有或指定的节点
    if (props.defaultExpandAll) {
      const expandAll = (nodes: TreeChatNode[]) => {
        nodes.forEach((node) => {
          if (node.children && node.children.length > 0) {
            internalExpandedKeys.value.add(node.id)
            expandAll(node.children)
          }
        })
      }
      // 多棵树模式下展开所有树的数据
      if (hasMultipleTrees.value) {
        props.trees?.forEach(tree => expandAll(tree))
      }
      else {
        // data 为可选 prop，空值安全兜底
        expandAll(props.data ?? [])
      }
    }

    // 等待节点渲染后更新连接线
    nextTick(() => {
      requestAnimationFrame(() => {
        updateConnectionLines()
      })
    })

    // 监听窗口大小变化
    window.addEventListener('resize', updateConnectionLines)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateConnectionLines)
  })

  // 监听数据变化
  watch(
    [() => props.data, () => props.trees],
    () => {
      if (props.defaultExpandAll) {
        internalExpandedKeys.value.clear()
        const expandAll = (nodes: TreeChatNode[]) => {
          nodes.forEach((node) => {
            if (node.children && node.children.length > 0) {
              internalExpandedKeys.value.add(node.id)
              expandAll(node.children)
            }
          })
        }
        // 多棵树模式下展开所有树的数据
        if (hasMultipleTrees.value) {
          props.trees?.forEach(tree => expandAll(tree))
        }
        else {
          // data 为可选 prop，空值安全兜底
          expandAll(props.data ?? [])
        }
      }
      nextTick(() => {
        requestAnimationFrame(() => {
          updateConnectionLines()
        })
      })
    },
    { deep: true },
  )

  // 监听展开状态变化
  watch(
    () => [...currentExpandedKeys.value],
    () => {
      nextTick(() => {
        requestAnimationFrame(() => {
          setTimeout(updateConnectionLines, 50)
        })
      })
    },
  )

  return {
    // 模板引用
    containerRef,
    canvasWrapperRef,
    canvasRef,
    linesSvgRef,
    // 缩放/平移状态
    scale,
    // 画布尺寸
    canvasWidth,
    canvasHeight,
    // 内部布局
    internalLayout,
    // 拖拽状态
    isPanning,
    // 连接线
    connectionLines,
    // 计算属性
    hasMultipleTrees,
    isEmpty,
    canvasStyle,
    canvasWrapperStyle,
    mergedNodeConfig,
    currentExpandedKeys,
    // 方法
    getNodeKey,
    setLayout,
    zoomIn,
    zoomOut,
    resetView,
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    handleNodeClick,
    handleToggleExpand,
  }
}
