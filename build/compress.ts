import type { Plugin } from 'vite'
import compressPlugin from 'vite-plugin-compression'

/**
 * 打包压缩格式类型
 * - none: 不压缩
 * - gzip: gzip 压缩
 * - brotli: brotli 压缩（需要 Node zlib 支持）
 * - both: gzip + brotli
 * - 上述任意格式 + `-clear` 后缀：压缩后删除原始文件
 */
export type ViteCompression = 'none'
  | 'gzip'
  | 'brotli'
  | 'both'
  | 'gzip-clear'
  | 'brotli-clear'
  | 'both-clear'

interface CompressConfig {
  ext: string
  algorithm?: 'gzip' | 'brotliCompress'
  threshold: number
  filter?: () => boolean
  deleteOriginFile: boolean
}

/**
 * 生成可配置的 gzip / brotli 压缩插件
 *
 * 参考 partner-collab-platform-web 的 build/compress.ts，简化为不依赖 extra 依赖。
 * 通过环境变量 VITE_COMPRESSION 控制压缩策略（默认 gzip）。
 */
export function configCompressPlugin(
  compress: ViteCompression = 'gzip',
): Plugin | Plugin[] | null {
  if (compress === 'none')
    return null

  const gz: CompressConfig = {
    // 生成的压缩包后缀
    ext: '.gz',
    // 压缩阈值（字节），0 表示压缩所有文件
    threshold: 10240,
    // 压缩后是否删除原始文件
    deleteOriginFile: false,
  }
  const br: CompressConfig = {
    ext: '.br',
    algorithm: 'brotliCompress',
    threshold: 10240,
    deleteOriginFile: false,
  }

  const codeList: { k: string, v: CompressConfig | CompressConfig[] }[] = [
    { k: 'gzip', v: gz },
    { k: 'brotli', v: br },
    { k: 'both', v: [gz, br] },
  ]

  const plugins: Plugin[] = []

  for (const item of codeList) {
    if (compress.includes(item.k)) {
      const clear = compress.includes('clear')
      const items = Array.isArray(item.v) ? item.v : [item.v]
      for (const cfg of items) {
        plugins.push(compressPlugin({ ...cfg, deleteOriginFile: clear }))
      }
    }
  }

  return plugins
}
