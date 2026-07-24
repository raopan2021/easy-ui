/**
 * xly 组件自动导入解析器
 *
 * 规则：
 * - 组件名必须以 Xly 开头
 * - 默认路径：`@/components/xly-{body-kebab}/index.vue`
 * - 特殊映射（子组件 / 目录名不一致）在 `SPECIAL_MAP` 中配置
 */
import type { ComponentResolver } from "unplugin-vue-components";

export function xlyComponentResolver(): ComponentResolver {
  /** 组件名 → 相对于 @/components/xly 的导入路径 */
  const SPECIAL_MAP: Record<string, string> = {
    XlyFormItem: "xly-form/xly-form-item.vue",
    XlyDescriptionsItem: "xly-descriptions/item.vue",
    XlyRadioGroup: "xly-radio/radio-group.vue",
    XlyUpload: "xly-file-upload/index.vue",
    XlyFileUpload: "xly-file-upload/index.vue",
    XlySteps: "xly-steps/index.vue",
    XlyStep: "xly-steps/step.vue",
  };

  return {
    type: "component",
    resolve(name: string) {
      if (!name.startsWith("Xly")) return;

      // 优先使用显式映射
      if (SPECIAL_MAP[name]) {
        return { from: `@/components/${SPECIAL_MAP[name]}` };
      }

      // 通用规则：XlyXxxYyy → xly-xxx-yyy/index.vue
      const body = name.slice(3); // 去掉 "Xly" 前缀
      const kebab = body
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/, "");
      return { from: `@/components/xly-${kebab}/index.vue` };
    }
  };
}
