import type { Permission, PermissionProps, RowItem, TableRow } from './types'

import { computed } from 'vue'

/** 各层级默认表头文案 */
const defaultHeaders: Record<number, string[]> = {
  1: ['功能模块'],
  2: ['功能模块', '页面权限'],
  3: ['功能模块', '页面权限', '操作权限'],
  4: ['功能模块', '页面权限', '操作权限', '功能权限'],
  5: ['功能模块', '页面权限', '操作权限', '功能权限', '数据权限'],
}

/**
 * 表格结构构建（适配一级 / 二级 / 三级 / 四五级）。
 *
 * 行构建规则与原实现完全一致：
 * - 一级：每个模块一行，无页面列；
 * - 二级 / 三级：每个页面一行（三级的操作在单元格内横向排列）；
 * - 四五级：每个操作一行，功能与数据在单元格内横向排列。
 *
 * @param props 权限组件 props（响应式对象）
 * @param getItemDisabled 节点禁用判断函数（由 usePermissionTree 提供，保证与树状态一致）
 */
export function usePermissionTable(
  props: PermissionProps,
  getItemDisabled: (item: Permission, level: number) => boolean,
) {
  /** 实际渲染的表头（自定义优先，否则按 maxLevel 取默认） */
  const displayHeaders = computed(() => {
    if (props.headers && props.headers.length > 0)
      return props.headers
    return defaultHeaders[props.maxLevel ?? 3] || defaultHeaders[3]
  })

  /** 表格行数据（含 rowspan 合并信息） */
  const tableRows = computed<TableRow[]>(() => {
    const rows: TableRow[] = []
    const sourceData = props.data ?? []
    let idx = 0

    // 一级结构：每个模块一行，没有页面列
    if (props.maxLevel === 1) {
      sourceData.forEach((mod) => {
        rows.push({
          key: `row-${idx++}`,
          moduleId: mod[props.idKey!],
          moduleLabel: mod[props.labelKey!],
          moduleDisabled: getItemDisabled(mod, 1),
          moduleRowspan: 1,
          isModuleFirst: true,
          pageId: '',
          pageLabel: '',
          pageDisabled: false,
          pageRowspan: 0,
          isPageFirst: false,
          action: null,
          actions: [],
          features: [],
          dataItems: [],
        })
      })
      return rows
    }

    sourceData.forEach((mod) => {
      const moduleId = mod[props.idKey!]
      const moduleLabel = mod[props.labelKey!]
      const moduleDisabled = getItemDisabled(mod, 1)
      const pages = mod[props.childrenKey!] || []

      // 计算模块跨行数
      let moduleRowspan = 0
      if (props.maxLevel === 2) {
        // 二级：每个页面一行
        moduleRowspan = pages.length
      }
      else if (props.maxLevel === 3) {
        // 三级：每个页面一行
        moduleRowspan = pages.length
      }
      else {
        // 四五级：每个操作一行
        pages.forEach((page: Permission) => {
          moduleRowspan += (page[props.childrenKey!] || []).length
        })
      }

      let moduleFirstShown = true

      if (props.maxLevel === 2) {
        // ===== 二级：每个页面一行 =====
        pages.forEach((page: Permission) => {
          rows.push({
            key: `row-${idx++}`,
            moduleId,
            moduleLabel,
            moduleDisabled,
            moduleRowspan,
            isModuleFirst: moduleFirstShown,
            pageId: page[props.idKey!],
            pageLabel: page[props.labelKey!],
            pageDisabled: getItemDisabled(page, 2),
            pageRowspan: 1,
            isPageFirst: true,
            action: null,
            actions: [],
            features: [],
            dataItems: [],
          })
          moduleFirstShown = false
        })
      }
      else if (props.maxLevel === 3) {
        // ===== 三级：每个页面一行，操作横向排列 =====
        pages.forEach((page: Permission) => {
          const pageId = page[props.idKey!]
          const pageLabel = page[props.labelKey!]
          const pageDisabled = getItemDisabled(page, 2)
          const ops = page[props.childrenKey!] || []
          const actions = ops.map((op: Permission) => ({
            _id: op[props.idKey!],
            _label: op[props.labelKey!],
            _disabled: getItemDisabled(op, 3),
          }))

          rows.push({
            key: `row-${idx++}`,
            moduleId,
            moduleLabel,
            moduleDisabled,
            moduleRowspan,
            isModuleFirst: moduleFirstShown,
            pageId,
            pageLabel,
            pageDisabled,
            pageRowspan: 1,
            isPageFirst: true,
            action: { _id: actions[0]?._id, _label: '', _disabled: false },
            actions,
            features: [],
            dataItems: [],
          })

          moduleFirstShown = false
        })
      }
      else {
        // ===== 四五级：每个操作一行 =====
        pages.forEach((page: Permission) => {
          const pageId = page[props.idKey!]
          const pageLabel = page[props.labelKey!]
          const pageDisabled = getItemDisabled(page, 2)
          const ops = page[props.childrenKey!] || []
          const pageRowspan = ops.length

          ops.forEach((op: Permission, oi: number) => {
            const features: RowItem[] = []
            const dataItems: RowItem[] = []
            ;(op[props.childrenKey!] || []).forEach((fn: Permission) => {
              features.push({
                _id: fn[props.idKey!],
                _label: fn[props.labelKey!],
                _disabled: getItemDisabled(fn, 4),
              })
              ;(fn[props.childrenKey!] || []).forEach((data: Permission) => {
                dataItems.push({
                  _id: data[props.idKey!],
                  _label: data[props.labelKey!],
                  _disabled: getItemDisabled(data, 5),
                })
              })
            })

            rows.push({
              key: `row-${idx++}`,
              moduleId,
              moduleLabel,
              moduleDisabled,
              moduleRowspan,
              isModuleFirst: moduleFirstShown,
              pageId,
              pageLabel,
              pageDisabled,
              pageRowspan,
              isPageFirst: oi === 0,
              action: {
                _id: op[props.idKey!],
                _label: op[props.labelKey!],
                _disabled: getItemDisabled(op, 3),
              },
              actions: [],
              features,
              dataItems,
            })

            moduleFirstShown = false
          })
        })
      }
    })

    return rows
  })

  return {
    displayHeaders,
    tableRows,
  }
}
