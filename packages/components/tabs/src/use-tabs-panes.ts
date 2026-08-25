import type { TabPaneInfo, TabsProps } from './tabs'

import { computed, provide, ref } from 'vue'

/**
 * Tabs 面板注册表 + provide 上下文。
 *
 * 将原本内联在 tabs.vue 中的 `uidSeed`/`panes` 注册注销机制与 `provide` 抽离为
 * 独立 composable，让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 * 子组件 `EasyTabPane` 通过 `inject('easyTabsContext')` 注册/注销自身。
 *
 * @param props Tabs props（需传入响应式对象，activeName 由 modelValue 派生）
 */
export function useTabsPanes(props: TabsProps) {
  /** 面板 uid 自增种子 */
  let uidSeed = 0

  /** 已注册面板列表（含 uid，供模板 v-for 与活动指示条定位使用） */
  const panes = ref<TabPaneInfo[]>([])

  /** 子组件 TabPane 调用此方法注册自己 */
  function registerPane(pane: Omit<TabPaneInfo, 'uid'>) {
    uidSeed++
    const uid = uidSeed
    panes.value.push({ uid, ...pane })
  }

  /** 子组件 TabPane 调用此方法注销自己 */
  function unregisterPane(name: string | number) {
    const idx = panes.value.findIndex(p => p.name === name)
    if (idx > -1)
      panes.value.splice(idx, 1)
  }

  // provide 给子组件（EasyTabPane）使用：当前激活名 + 注册/注销方法
  provide('easyTabsContext', {
    activeName: computed(() => props.modelValue),
    registerPane,
    unregisterPane,
  })

  return {
    panes,
  }
}
