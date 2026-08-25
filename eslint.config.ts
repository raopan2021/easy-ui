import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  stylistic: { indent: 2, quotes: 'single' },
  formatters: { css: true, html: true, markdown: 'prettier' },
}, {
  // template-admin 是独立 workspace（pure-admin 模板），有自己的工具链，
  // 由根 eslint 检查会误报大量模板遗留问题，豁免。
  ignores: ['pnpm-workspace.yaml', '.npmrc', '**/README.md', '.workbuddy/**', '.codebuddy/**', 'template-admin/**'],
}, {
  // 全局 TS/JS 规则
  rules: {
    'ts/no-use-before-define': 'warn',
    'no-unmodified-loop-condition': 'warn',
  },
}, {
  // Vue 专属规则 — 添加 files 过滤，避免在 .md 等非 Vue 文件中崩溃
  files: ['**/*.vue'],
  rules: {
    'vue/custom-event-name-casing': 'off',
    'vue/no-use-v-if-with-v-for': 'warn',
    'vue/no-mutating-props': 'warn',
  },
}, {
  // demo 页面：console/alert 属于演示行为，其余规则不放松
  files: ['docs/src/views/**/*.vue'],
  rules: {
    'no-console': 'off',
    'no-alert': 'off',
  },
}, {
  // easy-ui 组件库：仅允许 warn/error 级别的 console
  files: ['packages/easy-ui/src/**/*.{vue,ts}'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
}, {
  // 单元测试：使用 test 关键字 + 中文描述；vi.mock 后导入被测模块是 vitest 惯例
  files: ['**/__tests__/**/*.{ts,tsx}'],
  rules: {
    'test/consistent-test-it': 'off',
    'test/prefer-lowercase-title': 'off',
    'import/first': 'off',
  },
}, {
  // build 目录（打包脚本）：允许 console.log 输出进度/提示
  files: ['docs/build/**/*.ts'],
  rules: {
    'no-console': 'off',
  },
}, {
  // easy-ui 是发布到 npm 的库：dependencies 必须用真实版本，
  // catalog 协议在 pnpm publish 后无法被消费方解析
  files: ['packages/easy-ui/package.json'],
  rules: {
    'pnpm/json-enforce-catalog': 'off',
  },
})
