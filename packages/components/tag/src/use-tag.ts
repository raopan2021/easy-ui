import type { EmitFn } from 'vue'

import type { TagEmits, TagProps } from './tag'
import { computed, ref } from 'vue'

/**
 * 标签组件核心逻辑：类名/样式派生 + 点击/关闭交互 + 可见性控制。
 *
 * 将原本内联在 tag.vue 中的 computed（tagClass / tagStyle）与事件处理
 * （handleClick / handleClose / show）抽离为独立 composable，便于单测复用，
 * 并让 .vue 仅承担「组合 + 模板」职责（对齐 markdown / progress 拆分规范）。
 * 行为与原实现完全一致。
 *
 * @param props 标签 props（响应式对象）
 * @param emit 标签事件发射器（由 defineEmits 返回）
 */
export function useTag(props: TagProps, emit: EmitFn<TagEmits>) {
  /** 标签可见性（关闭后置 false，可经 show() 复位） */
  const visible = ref(true)

  /** 根节点组合类名（类型 / 尺寸 / 效果 / 状态） */
  const tagClass = computed(() => [
    `easy-tag--${props.type}`,
    `easy-tag--${props.size}`,
    `easy-tag--${props.effect}`,
    {
      'is-round': props.round,
      'is-closable': props.closable,
      'is-clickable': props.clickable && !props.disabled,
      'is-disabled': props.disabled,
    },
  ])

  /** 自定义颜色样式（按 effect 生成背景 / 边框 / 文字色） */
  const tagStyle = computed<Record<string, string>>(() => {
    if (!props.color)
      return {} as Record<string, string>
    // 自定义颜色：根据 effect 生成相应样式
    const color = props.color
    if (props.effect === 'dark') {
      return {
        backgroundColor: color,
        borderColor: color,
        color: '#fff',
      }
    }
    if (props.effect === 'plain') {
      return {
        backgroundColor: 'transparent',
        borderColor: color,
        color,
      }
    }
    // light
    return {
      backgroundColor: `${color}1a`,
      borderColor: `${color}40`,
      color,
    }
  })

  /** 点击：仅可点击且未禁用时派发 click */
  function handleClick(e: MouseEvent) {
    if (props.disabled)
      return
    if (props.clickable) {
      emit('click', e)
    }
  }

  /** 关闭：派发 close 并隐藏（禁用时不响应） */
  function handleClose(e: MouseEvent) {
    if (props.disabled)
      return
    emit('close', e)
    visible.value = false
  }

  /** 重置显示状态（外部经 defineExpose 调用） */
  function show() {
    visible.value = true
  }

  return { visible, tagClass, tagStyle, handleClick, handleClose, show }
}
