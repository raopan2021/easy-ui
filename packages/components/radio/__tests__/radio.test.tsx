import { mount } from '@vue/test-utils'
import Radio from '../src/radio.vue'

describe('Radio 单选组件', () => {
  it('渲染基础单选按钮', () => {
    const wrapper = mount(() => <Radio label="A">选项A</Radio>)
    expect(wrapper.find('.easy-radio').exists()).toBe(true)
    expect(wrapper.find('.easy-radio__label').text()).toBe('选项A')
  })

  it('modelValue 与 label 相等时选中', () => {
    const wrapper = mount(() => <Radio label="A" modelValue="A">A</Radio>)
    expect(wrapper.find('.easy-radio').classes()).toContain('is-checked')
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('modelValue 与 label 不同时不选中', () => {
    const wrapper = mount(() => <Radio label="A" modelValue="B">A</Radio>)
    expect(wrapper.find('.easy-radio').classes()).not.toContain('is-checked')
  })

  it('点击单选触发 change 并更新值', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Radio label="A" modelValue="B" onChange={onChange} onUpdate:modelValue={onUpdate}>A</Radio>)
    await wrapper.find('.easy-radio').trigger('click')
    expect(onChange).toHaveBeenCalledWith('A')
    expect(onUpdate).toHaveBeenCalledWith('A')
  })

  it('disabled 禁用且不可点击', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <Radio label="A" modelValue="B" disabled onChange={onChange}>A</Radio>)
    expect(wrapper.find('.easy-radio').classes()).toContain('is-disabled')
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
    await wrapper.find('.easy-radio').trigger('click')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <Radio label="A" size="small">A</Radio>)
    expect(wrapper.find('.easy-radio').classes()).toContain('easy-radio--small')
  })

  it('border 添加边框类名', () => {
    const wrapper = mount(() => <Radio label="A" border>A</Radio>)
    expect(wrapper.find('.easy-radio').classes()).toContain('is-bordered')
  })

  it('name 应用到原生 input', () => {
    const wrapper = mount(() => <Radio label="A" name="group1">A</Radio>)
    expect((wrapper.find('input').element as HTMLInputElement).name).toBe('group1')
  })
})
