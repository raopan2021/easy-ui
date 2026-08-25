import type { VNode } from 'vue'
import type { JsonNodeProps } from './types'

import { computed, defineComponent, h } from 'vue'

/**
 * JSON 递归节点组件。
 *
 * 以 h() 手写渲染函数递归展开对象 / 数组，并把展开态切换通过 `toggle`
 * 事件冒泡给外层 EasyJsonViewer 统一维护（expandedSet / collapsedSet）。
 *
 * 从 json-viewer.vue 内联定义抽离，保持 name / props / emits 完全一致。
 */
export const JsonNode = defineComponent({
  name: 'JsonNode',
  props: {
    data: { type: null, required: true },
    path: { type: String, required: true },
    depth: { type: Number, required: true },
    maxDepth: { type: Number, required: true },
    theme: { type: String, required: true },
    expandedSet: { type: Set, required: true },
    collapsedSet: { type: Set, required: true },
  },
  emits: ['toggle'],
  setup(nodeProps: JsonNodeProps, { emit }) {
    // 当前是否展开
    const isExpanded = computed(() => {
      if (nodeProps.collapsedSet.has(nodeProps.path))
        return false
      if (nodeProps.expandedSet.has(nodeProps.path))
        return true
      // depth=0 表示全部展开，maxDepth=0 也表示全部展开
      return nodeProps.maxDepth <= 0 || nodeProps.depth < nodeProps.maxDepth
    })

    // 是否可展开
    const isExpandable = computed(() => {
      const d = nodeProps.data
      if (d === null)
        return false
      if (typeof d !== 'object')
        return false
      if (Array.isArray(d))
        return d.length > 0
      return Object.keys(d).length > 0
    })

    // 子项数量
    const itemCount = computed(() => {
      const d = nodeProps.data
      if (d === null || d === undefined || !isExpandable.value)
        return 0
      if (Array.isArray(d))
        return d.length
      return Object.keys(d).length
    })

    // 点击切换
    const handleClick = (e: Event) => {
      e.stopPropagation()
      if (!isExpandable.value)
        return
      emit('toggle', nodeProps.path, isExpanded.value)
    }

    // 渲染基础类型
    const renderPrimitive = (val: unknown, theme: string): VNode => {
      let cls = 'json-primitive'
      let text = String(val)
      if (val === null) {
        cls = 'json-null'
        text = 'null'
      }
      else if (typeof val === 'string') {
        cls = 'json-string'
        text = `"${val}"`
      }
      else if (typeof val === 'number') {
        cls = 'json-number'
      }
      else if (typeof val === 'boolean') {
        cls = 'json-boolean'
      }

      return h('span', { class: ['json-value', cls, `json-value--${theme}`] }, text)
    }

    // 递归渲染子节点
    const renderChildren = (d: unknown, path: string, depth: number, theme: string): VNode[] => {
      const nodes: VNode[] = []
      const indent = '  '.repeat(depth + 1)

      if (Array.isArray(d)) {
        d.forEach((item, idx) => {
          const childPath = `${path}-${idx}`
          nodes.push(h('span', { class: 'json-indent' }, `\n${indent}`))
          nodes.push(
            h(JsonNode, {
              data: item,
              path: childPath,
              depth: depth + 1,
              maxDepth: nodeProps.maxDepth,
              theme,
              expandedSet: nodeProps.expandedSet,
              collapsedSet: nodeProps.collapsedSet,
              onToggle: (id: string, current: boolean) => emit('toggle', id, current),
            }),
          )
          if (idx < d.length - 1) {
            nodes.push(h('span', { class: 'json-comma' }, ','))
          }
        })
      }
      else {
        const entries = Object.entries(d as Record<string, unknown>)
        entries.forEach(([key, val], idx) => {
          const childPath = `${path}-${key}`
          nodes.push(h('span', { class: 'json-indent' }, `\n${indent}`))
          nodes.push(
            h('span', { class: ['json-key', `json-key--${theme}`] }, `"${key}"`),
            h('span', { class: 'json-colon' }, ': '),
            h(JsonNode, {
              data: val,
              path: childPath,
              depth: depth + 1,
              maxDepth: nodeProps.maxDepth,
              theme,
              expandedSet: nodeProps.expandedSet,
              collapsedSet: nodeProps.collapsedSet,
              onToggle: (id: string, current: boolean) => emit('toggle', id, current),
            }),
          )
          if (idx < entries.length - 1) {
            nodes.push(h('span', { class: 'json-comma' }, ','))
          }
        })
      }
      return nodes
    }

    return () => {
      const d = nodeProps.data
      const t = nodeProps.theme
      const depth = nodeProps.depth
      const path = nodeProps.path
      const expanded = isExpanded.value

      // 基础类型
      if (d === null || typeof d !== 'object') {
        return h('span', { class: 'json-node' }, [renderPrimitive(d, t)])
      }

      // 对象或数组
      const isArr = Array.isArray(d)
      const open = isArr ? '[' : '{'
      const close = isArr ? ']' : '}'

      const content: VNode[] = []

      // 切换图标（图标在 { 前面）
      if (isExpandable.value) {
        content.push(h('span', { class: 'json-toggle', onClick: handleClick }, expanded ? '▼' : '▶'))
      }

      // 开括号
      content.push(h('span', { class: 'json-bracket' }, open))

      if (!expanded) {
        content.push(h('span', { class: ['json-collapsed', `json-collapsed--${t}`] }, `... ${itemCount.value} 项`))
      }
      else {
        const children = renderChildren(d, path, depth, t)
        content.push(...children)
        const indent = '  '.repeat(depth)
        content.push(h('span', { class: 'json-indent' }, `\n${indent}`))
      }

      content.push(h('span', { class: 'json-bracket' }, close))

      return h('span', { class: 'json-node' }, content)
    }
  },
})
