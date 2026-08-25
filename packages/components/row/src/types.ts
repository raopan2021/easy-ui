import type { InjectionKey, Ref } from 'vue'

/** 栅格间隔注入值（作用：Row 向 Col 传递水平/垂直间隔） */
export type GutterInjection = Ref<{ horizontal: number, vertical: number }>

/** Row 与 Col 之间共享的间隔注入 key */
export const ROW_GUTTER_KEY: InjectionKey<GutterInjection> = Symbol('easyRowGutter')

/** Row 组件 props */
export interface RowProps {
  /** 栅格间隔，支持像素值或响应式对象 { xs, sm, md, lg, xl } */
  gutter?: number | { xs?: number, sm?: number, md?: number, lg?: number, xl?: number }
  /** flex 布局，水平排列方式 */
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
  /** flex 布局，垂直对齐方式 */
  align?: 'top' | 'middle' | 'bottom' | 'stretch'
  /** 标签 */
  tag?: string
}
