import type { Ref } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export interface TocItem {
  /** 唯一 id（生成到标题的 data-toc-id） */
  id: string
  /** 标题文本 */
  label: string
  /** 层级（h2=1，h3=2，h4=3，依此类推） */
  level: number
}

/**
 * 自动为文档页生成目录。
 *
 * - 扫描 content 容器内的标题元素（h2~h6），生成目录树
 * - 页面滚动时计算当前激活章节，实现目录高亮联动
 * - 点击目录项滚动到对应标题位置
 * - 提供回到顶部能力
 *
 * @param contentRef 页面滚动容器引用（通常为 .layout-content）
 * @param options.scanSelector 限定扫描范围的选择器，默认 '.doc-section'
 * @param options.titleSelector 标题选择器，默认 'h2, h3, h4, h5, h6'
 */
export function useDocToc(
  contentRef: Ref<HTMLElement | undefined>,
  options: { scanSelector?: string; titleSelector?: string } = {},
) {
  const {
    scanSelector = '.doc-section',
    titleSelector = 'h2, h3, h4, h5, h6',
  } = options

  /** 当前扫描到的目录项 */
  const tocItems = ref<TocItem[]>([])
  /** 当前激活的目录项 id */
  const activeId = ref('')
  /** 是否已滚动到非顶部区域（用于控制回到顶部按钮显隐） */
  const scrolled = ref(false)

  /** 所有标题元素映射（id -> element），供定位滚动 */
  const headingMap = new Map<string, HTMLElement>()

  /** 记录正在程序化滚动，避免滚动监听反向触发高亮抖动 */
  let scrolling = false
  let scrollTimer = 0
  /** 回到顶部按钮的渐隐定时器 */
  let scrolledTimer = 0
  /** 标题 id 计数器，避免重名 */
  let idCounter = 0

  /** 是否生成了目录 */
  const hasToc = computed(() => tocItems.value.length > 0)

  // 收集标题并生成目录（扫描容器内全部标题，支持 h2~h6 深层级）
  function buildToc() {
    const container = contentRef.value
    if (!container)
      return

    tocItems.value = []
    headingMap.clear()
    idCounter = 0

    // 若指定了 scanSelector，则只在这些区块内收集标题；否则直接扫描容器全部标题
    const roots = scanSelector
      ? Array.from(container.querySelectorAll<HTMLElement>(scanSelector))
      : [container]
    const headings = new Set<HTMLElement>()

    for (const root of roots) {
      const found = root.querySelectorAll<HTMLElement>(titleSelector)
      for (const el of found)
        headings.add(el)
    }

    // 按文档顺序排序，保证目录层级连续
    const sorted = Array.from(headings).sort((a, b) => {
      const pos = (n: Node) => {
        let r = 0
        let node: Node | null = n
        while (node) {
          let i = 0
          let sibling: Node | null = node.previousSibling
          while (sibling) {
            i++
            sibling = sibling.previousSibling
          }
          r += i
          node = node.parentNode
        }
        return r
      }
      return pos(a) - pos(b)
    })

    for (const el of sorted) {
      // 归一化层级：h2 → 1，h3 → 2，…，h6 → 5，并限制最小为 1
      const rawLevel = Number(el.tagName.slice(1)) || 2
      const level = Math.max(1, rawLevel - 1)
      const id = `doc-toc-${idCounter++}`
      el.dataset.tocId = id
      headingMap.set(id, el)
      tocItems.value.push({
        id,
        label: el.textContent?.trim() || `章节 ${idCounter}`,
        level,
      })
    }
  }

  // 判断指定标题当前是否应高亮
  function isTitleActive(el: HTMLElement): boolean {
    const container = contentRef.value
    if (!container)
      return false

    const containerTop = container.getBoundingClientRect().top
    const titleTop = el.getBoundingClientRect().top
    // 标题顶部已越过容器顶部（进入视区）时视为激活
    return titleTop - containerTop <= 60
  }

  // 根据当前滚动位置更新激活目录项
  function updateActive() {
    if (scrolling)
      return

    let current = ''
    for (const item of tocItems.value) {
      const el = headingMap.get(item.id)
      if (el && isTitleActive(el))
        current = item.id
    }
    // 取最后一个进入视区的标题作为激活项
    activeId.value = current || tocItems.value[0]?.id || ''
  }

  // 平滑滚动到指定标题
  function scrollTo(id: string) {
    const el = headingMap.get(id)
    const container = contentRef.value
    if (!el || !container)
      return

    scrolling = true
    const offset = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 16
    container.scrollTo({ top: offset, behavior: 'smooth' })
    activeId.value = id

    window.clearTimeout(scrollTimer)
    scrollTimer = window.setTimeout(() => {
      scrolling = false
    }, 600)
  }

  // 平滑滚动到顶部
  function scrollToTop() {
    const container = contentRef.value
    if (!container)
      return

    scrolling = true
    container.scrollTo({ top: 0, behavior: 'smooth' })
    activeId.value = ''

    window.clearTimeout(scrollTimer)
    scrollTimer = window.setTimeout(() => {
      scrolling = false
    }, 600)
  }

  // 重建目录：切换路由后内容变化时调用
  async function refresh() {
    await nextTick()
    buildToc()
    scrolled.value = false
    updateActive()
  }

  function handleScroll() {
    const container = contentRef.value
    // 更新回到顶部按钮显隐（防抖）
    if (container) {
      window.clearTimeout(scrolledTimer)
      scrolledTimer = window.setTimeout(() => {
        scrolled.value = container.scrollTop > 200
      }, 100)
    }
    window.requestAnimationFrame(updateActive)
  }

  onMounted(() => {
    buildToc()
    contentRef.value?.addEventListener('scroll', handleScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    contentRef.value?.removeEventListener('scroll', handleScroll)
    window.clearTimeout(scrollTimer)
    window.clearTimeout(scrolledTimer)
  })

  return {
    tocItems,
    activeId,
    hasToc,
    scrolled,
    refresh,
    scrollTo,
    scrollToTop,
  }
}
