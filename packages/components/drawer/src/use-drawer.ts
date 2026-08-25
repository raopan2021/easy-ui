import type { DrawerEmits, DrawerProps } from './types'
import { computed, ref, watch } from 'vue'

/**
 * 抽屉组件核心逻辑：尺寸/方向派生 + 关闭交互 + 打开/关闭生命周期事件。
 *
 * 将原本内联在 drawer.vue 中的 computed 与 watch 抽离为独立 composable，
 * 便于单测复用，并让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown / progress 拆分规范）。行为与原实现完全一致。
 *
 * @param props 抽屉 props（响应式对象）
 * @param emit 抽屉事件发射器（由 defineEmits 返回）
 */
export function useDrawer(props: DrawerProps, emit: DrawerEmits) {
  /** 抽屉根节点 ref（如需手动操作 DOM 可用） */
  const drawerRef = ref<HTMLDivElement>()

  /** 是否为水平方向（left / right） */
  const isHorizontal = computed(() => props.direction === 'left' || props.direction === 'right')

  /** 抽屉尺寸行内样式（按方向决定 width / height，数值自动补 px） */
  const drawerStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}

    if (typeof props.size === 'number') {
      if (isHorizontal.value) {
        style.width = `${props.size}px`
      }
      else {
        style.height = `${props.size}px`
      }
    }
    else {
      if (isHorizontal.value) {
        style.width = props.size ?? '30%'
      }
      else {
        style.height = props.size ?? '30%'
      }
    }

    return style
  })

  /** 抽屉根节点组合类名（方向 + 自定义 class） */
  const drawerClass = computed(() => [`easy-drawer--${props.direction}`, props.customClass])

  /** 关闭抽屉：同步 v-model 并派发 close 事件 */
  function handleClose() {
    emit('update:modelValue', false)
    emit('close')
  }

  /** 点击遮罩：仅在 closeOnClickModal 为 true 时关闭 */
  function handleMaskClick() {
    if (props.closeOnClickModal) {
      handleClose()
    }
  }

  // ──── 打开生命周期：open 紧跟 opened（下一帧 DOM 就绪后派发）────
  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        emit('open')
        // 等 DOM 渲染完后触发 opened
        requestAnimationFrame(() => {
          emit('opened')
        })
      }
    },
  )

  // ──── ESC 关闭 + 关闭后清理 ────
  watch(
    () => props.modelValue,
    (val) => {
      if (!val)
        return
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && props.modelValue) {
          handleClose()
        }
      }
      window.addEventListener('keydown', handler)
      // 关闭后移除监听并触发 afterClose
      watch(
        () => props.modelValue,
        (v) => {
          if (!v) {
            window.removeEventListener('keydown', handler)
            emit('afterClose')
          }
        },
        { once: true },
      )
    },
  )

  return { drawerRef, isHorizontal, drawerStyle, drawerClass, handleClose, handleMaskClick }
}
