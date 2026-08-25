/**
 * 栅格断点响应式配置。
 * 用于 xs / sm / md / lg / xl 各断点的对象形式配置。
 */
export interface ColBreakpoint {
  /** 栅格占位格数 */
  span?: number
  /** 栅格左侧间隔格数 */
  offset?: number
  /** 栅格向右移动格数 */
  push?: number
  /** 栅格向左移动格数 */
  pull?: number
}

/**
 * Col 组件 props（栅格布局）。
 * 与 Row 的 gutter 注入配合实现栅格间距。
 */
export interface ColProps {
  /** 栅格占位格数（0-24） */
  span?: number
  /** 栅格左侧间隔格数 */
  offset?: number
  /** 栅格向右移动格数 */
  push?: number
  /** 栅格向左移动格数 */
  pull?: number
  /** <768px 响应式栅格数或配置 */
  xs?: number | ColBreakpoint
  /** ≥768px 响应式栅格数或配置 */
  sm?: number | ColBreakpoint
  /** ≥992px 响应式栅格数或配置 */
  md?: number | ColBreakpoint
  /** ≥1200px 响应式栅格数或配置 */
  lg?: number | ColBreakpoint
  /** ≥1920px 响应式栅格数或配置 */
  xl?: number | ColBreakpoint
}
