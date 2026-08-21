import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

/**
 * CSS 异步加载插件（减少渲染阻塞）
 *
 * 在构建产物生成后，把入口 HTML 中由 Vite 注入的 `<link rel="stylesheet">`
 * 改为异步加载：
 *   - `rel="preload" as="style"`：浏览器尽早并行下载 CSS，不阻塞渲染
 *   - `onload` 时切换为 stylesheet 应用样式
 *   - `<noscript>` 兜底（禁用 JS 时仍同步加载）
 *
 * 说明：首屏 loading 动画样式已内联在 index.html 的 `<style>` 中，
 * 业务 CSS 由 JS 渲染后应用，异步加载可显著缩短 LCP / FCP 关键路径。
 */
export function cssAsyncLoad(): Plugin {
  let outDir = "";

  return {
    name: "pure:css-async-load",
    configResolved(config: ResolvedConfig) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const htmlPath = join(outDir, "index.html");
      let html: string;
      try {
        html = readFileSync(htmlPath, "utf-8");
      } catch {
        return;
      }
      const next = html.replace(
        /<link\s+rel="stylesheet"\s+([^>]*?)href="([^"]+\.css)"[^>]*>/g,
        (_, rest, href) =>
          `<link rel="preload" as="style" ${rest}href="${href}" onload="this.onload=null;this.rel='stylesheet'">` +
          `<noscript><link rel="stylesheet" ${rest}href="${href}"></noscript>`
      );
      if (next !== html) {
        writeFileSync(htmlPath, next, "utf-8");
      }
    }
  };
}
