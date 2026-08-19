import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

// 模拟 wangEditor-for-vue 的 Toolbar / Editor 组件（真实组件强依赖 DOM，jsdom 无法运行）
// 注意：mock 组件必须内联定义在 vi.mock 工厂内，避免 hoisting 导致的引用错误
vi.mock('@wangeditor/editor-for-vue', () => {
  const Editor = defineComponent({
    props: ['modelValue'],
    emits: ['update:modelValue', 'onCreated', 'onChange'],
    setup() {
      return () => h('div', { class: 'mock-w-e-editor' })
    },
  })
  const Toolbar = defineComponent({
    setup() {
      return () => h('div', { class: 'mock-w-e-toolbar' })
    },
  })
  return { Editor, Toolbar }
})

vi.mock('@wangeditor/editor/dist/css/style.css', () => ({}))

import RichText from '../src/richtext.vue'

describe('RichText.vue', () => {
  test('render wrapper structure with toolbar', () => {
    const wrapper = mount(() => <RichText />)
    expect(wrapper.find('.easy-richtext').exists()).toBe(true)
    expect(wrapper.find('.easy-richtext__toolbar').exists()).toBe(true)
    expect(wrapper.find('.easy-richtext__body').exists()).toBe(true)
    expect(wrapper.find('.mock-w-e-editor').exists()).toBe(true)
    expect(wrapper.find('.mock-w-e-toolbar').exists()).toBe(true)
  })

  test('hide toolbar when showToolbar is false', () => {
    const wrapper = mount(() => <RichText showToolbar={false} />)
    expect(wrapper.find('.easy-richtext').classes()).toContain('is-no-toolbar')
    expect(wrapper.find('.easy-richtext__toolbar').exists()).toBe(false)
  })

  test('disabled adds class', () => {
    const wrapper = mount(() => <RichText disabled />)
    expect(wrapper.find('.easy-richtext').classes()).toContain('is-disabled')
  })
})
