import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import Markdown from '../src/markdown.vue'

describe('Markdown.vue', () => {
  test('render wrapper structure with toolbar', () => {
    const wrapper = mount(() => <Markdown />)
    expect(wrapper.find('.easy-markdown').exists()).toBe(true)
    expect(wrapper.find('.easy-markdown__toolbar').exists()).toBe(true)
    expect(wrapper.find('.easy-markdown__textarea').exists()).toBe(true)
    expect(wrapper.find('.easy-markdown__preview').exists()).toBe(true)
  })

  test('renders markdown to html in preview', () => {
    const wrapper = mount(() => <Markdown modelValue="# Hello" />)
    const preview = wrapper.find('.easy-markdown__preview')
    expect(preview.element.innerHTML).toContain('<h1>Hello</h1>')
  })

  test('textarea input emits update:modelValue and change', async () => {
    const onUpdate = vi.fn()
    const onChange = vi.fn()
    const wrapper = mount(() => <Markdown modelValue="" onUpdate:modelValue={onUpdate} onChange={onChange} />)
    const textarea = wrapper.find('.easy-markdown__textarea')
    await textarea.setValue('## 标题')
    await nextTick()
    expect(onUpdate).toHaveBeenCalledWith('## 标题')
    expect(onChange).toHaveBeenCalledWith('## 标题')
  })

  test('save button emits save event with current value', async () => {
    const onSave = vi.fn()
    const wrapper = mount(() => <Markdown modelValue="# content" onSave={onSave} />)
    await wrapper.find('.easy-markdown__action--primary').trigger('click')
    expect(onSave).toHaveBeenCalledWith('# content')
  })

  test('switch view buttons update active state', async () => {
    const wrapper = mount(() => <Markdown defaultView="edit" />)
    const btns = wrapper.findAll('.easy-markdown__view-btn')
    expect(btns[0]!.classes()).toContain('is-active')

    await btns[2]!.trigger('click')
    expect(btns[2]!.classes()).toContain('is-active')
    expect(btns[0]!.classes()).not.toContain('is-active')
  })
})
