import type { Plugin } from 'vite'
import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import boxen from 'boxen'
import gradient from 'gradient-string'

/** 收集目录下所有文件的总字节数 */
async function getDirSize(dir: string): Promise<number> {
  let total = 0
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      total += await getDirSize(full)
    }
    else if (entry.isFile()) {
      total += (await stat(full)).size
    }
  }
  return total
}

/** 格式化字节数 */
function formatBytes(bytes: number): string {
  if (bytes <= 0)
    return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const val = bytes / 1024 ** i
  return `${val.toFixed(2)} ${units[i]}`
}

/** 记录构建耗时 */
function formatDuration(ms: number): string {
  const totalSec = ms / 1000
  if (totalSec < 1)
    return `${Math.round(ms)}ms`
  if (totalSec < 60)
    return `${totalSec.toFixed(2)}s`
  const min = Math.floor(totalSec / 60)
  const sec = (totalSec % 60).toFixed(1)
  return `${min}m ${sec}s`
}

/**
 * 构建信息提示插件
 *
 * - buildStart：输出欢迎信息
 * - closeBundle：统计产物大小 + 打印构建总耗时（boxen 渐变边框）
 */
export function viteBuildInfo(): Plugin {
  let startTime = 0
  let outDir = 'dist'

  return {
    name: 'vite:build-info',
    config(_userConfig, { command }) {
      if (command === 'build')
        startTime = Date.now()
    },
    configResolved(config) {
      // outDir 相对 config.root 解析为绝对路径，避免 getDirSize 相对进程 cwd 误解析
      outDir = resolve(config.root, config.build?.outDir ?? 'dist')
    },
    buildStart() {
      if (startTime) {
        console.log(
          boxen(
            gradient(['cyan', 'magenta']).multiline('🚀 开始构建 EasyUI 文档站...'),
            { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'cyan' },
          ),
        )
      }
    },
    closeBundle() {
      if (!startTime)
        return
      getDirSize(outDir)
        .then((size) => {
          const duration = formatDuration(Date.now() - startTime)
          console.log(
            boxen(
              gradient(['green', 'cyan']).multiline(
                [
                  '🎉 恭喜打包完成！',
                  '',
                  `📁 产物目录：${outDir}`,
                  `📦 产物大小：${formatBytes(size)}`,
                  `🕐 构建耗时：${duration}`,
                ].join('\n'),
              ),
              { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'green' },
            ),
          )
        })
        .catch((err) => {
          console.error(`[build-info] 读取产物大小失败: ${(err as Error).message}`)
        })
    },
  }
}
