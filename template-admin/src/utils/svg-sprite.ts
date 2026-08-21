/**
 * SVG 雪碧图（Symbol Sprite）
 *
 * 构建/启动时用 import.meta.glob 将 src/assets/svg 下所有图标以内联字符串形式读入，
 * 提取 viewBox 与原始 width/height 生成 <symbol> 集合，注入到 body 顶部一次。
 * 使用处通过 <SvgIcon name="logout" /> 引用，<use href="#icon-logout"> 复用同一份定义，
 * 既保留 currentColor 着色能力，又避免 vite-svg-loader 逐模块转换的开销。
 *
 * 纯 Vite 原生能力（import.meta.glob + ?raw），不依赖任何第三方插件，兼容 Vite 8/Rolldown。
 */
const modules = import.meta.glob(['../assets/svg/*.svg', '../assets/login/*.svg'], {
  query: '?raw',
  eager: true,
  import: 'default',
}) as Record<string, string>

/** 图标原始尺寸信息，供 <SvgIcon> 还原各 SVG 自身的 width/height */
const iconMeta: Record<string, { width?: string, height?: string }> = {}

const symbols = Object.entries(modules)
  .map(([path, raw]) => {
    const name = path.match(/\/([^/]+)\.svg$/)?.[1] ?? ''
    const viewBox = raw.match(/\sviewBox="([^"]+)"/)?.[1]
    const width = raw.match(/\swidth="([^"]+)"/)?.[1]
    const height = raw.match(/\sheight="([^"]+)"/)?.[1]
    if (width || height)
      iconMeta[name] = { width, height }
    // 去掉外层 <svg> 标签，保留内部内容作为 <symbol> 主体
    const inner = raw.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    return `<symbol id="icon-${name}"${viewBox ? ` viewBox="${viewBox}"` : ''}>${inner}</symbol>`
  })
  .join('')

const spriteSvg = `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">${symbols}</svg>`

const SPRITE_ID = '__svg_sprite__'

/** 将雪碧图注入到 document.body 顶部（仅执行一次） */
export function setupSvgSprite() {
  if (typeof document === 'undefined')
    return
  if (document.getElementById(SPRITE_ID))
    return
  const wrap = document.createElement('div')
  wrap.id = SPRITE_ID
  wrap.innerHTML = spriteSvg
  document.body.insertBefore(wrap, document.body.firstChild)
}

/** 数值尺寸补 px，带单位的原样返回 */
function normalizeSize(val?: string): string | undefined {
  if (!val)
    return undefined
  return /^\d+(\.\d+)?$/.test(val) ? `${val}px` : val
}

/** 读取图标的默认 width/height（已归一化为合法 CSS 值） */
export function getIconSize(name: string) {
  const meta = iconMeta[name]
  return {
    width: normalizeSize(meta?.width) ?? '1em',
    height: normalizeSize(meta?.height) ?? '1em',
  }
}
