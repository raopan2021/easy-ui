import type { CSSProperties } from 'vue'
import { h } from 'vue'

// 通用图标渲染组件，支持 Vue 组件（Element Plus 图标 / SVG 组件）
// 替代原来的 IconifyIconOffline
// 支持 size 属性控制图标尺寸（数字按 px，字符串直接作为 CSS 值）
export default defineComponent({
  name: 'PureIcon',
  props: {
    icon: {
      default: null,
    },
    size: {
      type: [Number, String],
      default: undefined,
    },
  },
  render() {
    if (!this.icon)
      return null
    const attrs = this.$attrs
    const sizeStyle: CSSProperties = {}
    if (this.size !== undefined) {
      const val
        = typeof this.size === 'number' ? `${this.size}px` : this.size
      sizeStyle.width = val
      sizeStyle.height = val
      // Element Plus 图标通过 font-size 控制内部 svg 大小
      sizeStyle.fontSize = val
    }
    return h(
      this.icon,
      {
        'aria-hidden': true,
        'style': attrs?.style
          ? Object.assign({}, sizeStyle, attrs.style as object, {
              outline: 'none',
            })
          : { ...sizeStyle, outline: 'none' },
        ...attrs,
      },
      {
        default: () => [],
      },
    )
  },
})
