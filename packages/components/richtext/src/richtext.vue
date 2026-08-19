<script setup lang="ts">
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { computed, ref, shallowRef } from 'vue'
import '@wangeditor/editor/dist/css/style.css'

export interface RichTextProps {
  /** 绑定值（HTML 字符串） */
  modelValue?: string
  /** 占位符 */
  placeholder?: string
  /** 高度（像素） */
  height?: number
  /** 最小高度（像素） */
  minHeight?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否显示默认工具栏 */
  showToolbar?: boolean
  /** 工具栏配置 */
  toolbarConfig?: Partial<IToolbarConfig>
  /** 编辑器配置 */
  editorConfig?: Partial<IEditorConfig>
}

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

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'created', editor: IDomEditor): void
  (e: 'focus', editor: IDomEditor): void
  (e: 'blur', editor: IDomEditor): void
  (e: 'destroyed', editor: IDomEditor): void
}>()

const editorRef = shallowRef<IDomEditor>()

// 工具栏配置：默认展示常用能力，可通过 props.toolbarConfig 覆盖/合并
const toolbarConfig = computed<Partial<IToolbarConfig>>(() => ({
  excludeKeys: props.showToolbar ? [] : ['group-video', 'group-image', 'fullScreen'],
  ...props.toolbarConfig,
}))

// 编辑器配置
const editorConfig = computed<Partial<IEditorConfig>>(() => ({
  placeholder: props.placeholder,
  readOnly: props.readonly || props.disabled,
  ...props.editorConfig,
}))

// 处理内容变化，同步 v-model
function handleChange(editor: IDomEditor) {
  const html = editor.getHtml()
  emit('update:modelValue', html)
  emit('change', html)
}

// 编辑器创建完成
function handleCreated(editor: IDomEditor) {
  editorRef.value = editor
  // 初始值回填（wangEditor v-model 首次不自动填充，需手动 setHtml）
  if (props.modelValue && editor.isEmpty())
    editor.setHtml(props.modelValue)
  emit('created', editor)
}

// 暴露方法
function getHtml(): string {
  return editorRef.value?.getHtml() ?? props.modelValue ?? ''
}
function getText(): string {
  return editorRef.value?.getText() ?? ''
}
function setHtml(html: string) {
  editorRef.value?.setHtml(html ?? '')
}
function clear() {
  editorRef.value?.clear()
  emit('update:modelValue', '')
  emit('change', '')
}
function focus() {
  editorRef.value?.focus()
}
function blur() {
  editorRef.value?.blur()
}

function handleDestroyed(editor: IDomEditor) {
  emit('destroyed', editor)
  editorRef.value = undefined
}

defineExpose({ getHtml, getText, setHtml, clear, focus, blur })
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
      <Toolbar
        :editor="editorRef"
        :default-config="toolbarConfig"
        mode="default"
      />
    </div>

    <div class="easy-richtext__body">
      <Editor
        :model-value="modelValue"
        :default-config="editorConfig"
        mode="default"
        :style="{ height: `${height}px`, minHeight: `${minHeight}px` }"
        @update:model-value="(v: string) => emit('update:modelValue', v)"
        @on-created="handleCreated"
        @on-change="handleChange"
        @on-focus="(e: IDomEditor) => emit('focus', e)"
        @on-blur="(e: IDomEditor) => emit('blur', e)"
        @on-destroyed="handleDestroyed"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.easy-richtext {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-bg-color);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  &:focus-within {
    border-color: var(--el-color-primary);
  }

  &.is-disabled,
  &.is-readonly {
    cursor: not-allowed;
  }

  &.is-no-toolbar {
    border: none;
    border-radius: 0;
  }

  .easy-richtext__toolbar {
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-blank);
    z-index: 1;

    :deep(.w-e-toolbar) {
      border: none;
      background: transparent;
    }
  }

  .easy-richtext__body {
    :deep(.w-e-text-container) {
      background: var(--el-bg-color);
    }
  }
}
</style>
