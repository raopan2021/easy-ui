import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  stylistic: { indent: 2, quotes: 'single' },
  formatters: { css: true, html: true, markdown: 'prettier' },
}, {
  ignores: ['pnpm-workspace.yaml', '.npmrc', '**/README.md'],
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
  files: ['src/views/**/*.vue'],
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
  files: ['build/**/*.ts'],
  rules: {
    'no-console': 'off',
  },
})
