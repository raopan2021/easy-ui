/**
 * timeline-item.ts（历史入口）
 *
 * 原文件以 buildProps 维护 props 类型，本次重构将类型定义统一收敛到同目录 `types.ts`，
 * 这里仅做 re-export 转发，确保 `timeline/index.ts` 中的 `export * from './src/timeline-item'`
 * 仍能正确导出 `TimelineItemProps` / `TimelineStatus` 等类型，保持对外 API 不变。
 */
export * from './types'
