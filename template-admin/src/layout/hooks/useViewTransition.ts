import type { Ref } from 'vue'

/**
 * View Transition API 暗色模式切换动画（仿 VitePress 圆形扩散效果）
 *
 * 用法：
 *   const { recordPos, toggle } = useViewTransition(dataTheme);
 *   // 模板：<div @pointerdown="recordPos">
 *   // 点击时：await toggle();
 */
export function useViewTransition(darkRef: Ref<boolean>) {
  /** 记录上次点击位置，默认屏幕中心 */
  const lastClickPos = ref({ x: innerWidth / 2, y: innerHeight / 2 })

  function recordPos(e: PointerEvent) {
    lastClickPos.value = { x: e.clientX, y: e.clientY }
  }

  const enableTransitions = () =>
    'startViewTransition' in document
    && window.matchMedia('(prefers-reduced-motion: no-preference)').matches

  async function toggle() {
    if (!enableTransitions()) {
      darkRef.value = !darkRef.value
      return
    }

    const { x, y } = lastClickPos.value
    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${radius}px at ${x}px ${y}px)`,
    ]

    // oxlint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const transition = document.startViewTransition(async () => {
      darkRef.value = !darkRef.value
      await nextTick()
    })

    try {
      await transition.ready
      document.documentElement.animate(
        { clipPath: darkRef.value ? [...clipPath].reverse() : clipPath },
        {
          duration: 500,
          easing: 'ease',
          fill: 'forwards',
          pseudoElement: `::view-transition-${darkRef.value ? 'old' : 'new'}(root)`,
        },
      )
    }
    catch {
      // View Transition 失败时已直接切换，无需额外处理
    }
  }

  return { recordPos, toggle }
}
