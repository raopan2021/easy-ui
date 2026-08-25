<script setup lang="ts">
import type { IDomEditor, RichTextEmits, RichTextProps } from './richtext'

import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { useRichText } from './use-richtext'
import '@wangeditor/editor/dist/css/style.css'

defineOptions({
  name: 'EasyRichText',
})

const props = withDefaults(defineProps<RichTextProps>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  height: 300,
  minHeight: 200,
  disabled: false,
  readonly: false,
  showToolbar: true,
  toolbarConfig: () => ({}),
  editorConfig: () => ({}),
})

const emit = defineEmits<RichTextEmits>()

const {
  editorRef,
  toolbarConfig,
  editorConfig,
  handleChange,
  handleCreated,
  handleDestroyed,
  getHtml,
  getText,
  setHtml,
  clear,
  focus,
  blur,
} = useRichText(props, emit)

defineExpose({ getHtml, getText, setHtml, clear, focus, blur })

// 保持对外类型导出兼容（原定义在 richtext.ts）
export type { RichTextEmits, RichTextProps } from './richtext'
</script>

<template>
  <div
    class="easy-richtext"
    :class="{
      'is-disabled': disabled,
      'is-readonly': readonly,
      'is-no-toolbar': !showToolbar,
    }"
  >
    <div v-if="showToolbar" class="easy-richtext__toolbar">
      <Toolbar :editor="editorRef" :default-config="toolbarConfig" mode="default" />
    </div>

    <div class="easy-richtext__body">
      <Editor
        :model-value="modelValue" :default-config="editorConfig" mode="default"
        :style="{ height: `${height}px`, minHeight: `${minHeight}px` }"
        @update:model-value="(v: string) => emit('update:modelValue', v)" @on-created="handleCreated"
        @on-change="handleChange" @on-focus="(e: IDomEditor) => emit('focus', e)"
        @on-blur="(e: IDomEditor) => emit('blur', e)" @on-destroyed="handleDestroyed"
      />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 richtext-style.scss） -->
<style scoped src="./richtext-style.scss" lang="scss"></style>

<!-- wangEditor dark 主题变量覆盖（全局，独立维护在 richtext-theme.scss） -->
<style src="./richtext-theme.scss" lang="scss"></style>
