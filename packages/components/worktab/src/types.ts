/**
 * EasyWorktab 工作标签页组件类型定义
 *
 * worktab 没有对外 props / emits，仅通过 defineExpose 暴露 `onTabsChange` 方法，
 * 这里集中声明 expose 的类型，供 worktab.vue 与 use-worktab.ts 共用并对外导出兼容。
 */

/** 组件通过 defineExpose 对外暴露的方法 */
export interface WorktabExpose {
  /** 标签页变化后的滚动状态校正与滚动到激活项 */
  onTabsChange: () => void
}
