import { defineComponent, h } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

/**
 * 创建一个渲染 <SvgIcon :name> 的轻量组件，供"需要组件引用"的 API 使用：
 * el-switch :active-icon / :inactive-icon、Segmented 的 icon 配置、
 * PureIcon :icon、markRaw() 等。这些 API 接收组件并用 <component :is> 渲染，
 * 无法直接传 <SvgIcon name="...">，故用本工厂包成等价组件。
 *
 * 透传的 attrs（如 Segmented 的 iconAttrs.fill）会经 Vue fallthrough 落到 <svg>，
 * 进而级联到 <use> 引用的 symbol，与原 ?component 内联 SVG 行为一致。
 */
export function makeIcon(name: string) {
  return defineComponent({
    name: `SvgIcon-${name}`,
    render() {
      return h(SvgIcon, { name })
    },
  })
}
