import { mount } from '@vue/test-utils'
import Switch from '../src/switch.vue'

describe('Switch 开关组件', () => {
  it('渲染基础开关', () => {
    const wrapper = mount(() => <Switch modelValue={false} />)
    expect(wrapper.find('.easy-switch').exists()).toBe(true)
    expect(wrapper.find('.easy-switch__core').exists()).toBe(true)
  })

  it('modelValue 为 true 时选中', () => {
    const wrapper = mount(() => <Switch modelValue />)
    expect(wrapper.find('.easy-switch').classes()).toContain('is-checked')
  })

  it('modelValue 为 false 时不选中', () => {
    const wrapper = mount(() => <Switch modelValue={false} />)
    expect(wrapper.find('.easy-switch').classes()).not.toContain('is-checked')
  })

  it('点击开关切换并触发 change', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Switch modelValue={false} onChange={onChange} onUpdate:modelValue={onUpdate} />)
    await wrapper.find('.easy-switch').trigger('click')
    expect(onChange).toHaveBeenCalledWith(true)
    expect(onUpdate).toHaveBeenCalledWith(true)
  })

  it('选中状态点击切换为关闭', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <Switch modelValue onChange={onChange} />)
    await wrapper.find('.easy-switch').trigger('click')
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('disabled 禁用且不可点击', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <Switch modelValue={false} disabled onChange={onChange} />)
    expect(wrapper.find('.easy-switch').classes()).toContain('is-disabled')
    await wrapper.find('.easy-switch').trigger('click')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('loading 显示加载状态且不可点击', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <Switch modelValue={false} loading onChange={onChange} />)
    expect(wrapper.find('.easy-switch').classes()).toContain('is-loading')
    expect(wrapper.find('.easy-switch__loading').exists()).toBe(true)
    await wrapper.find('.easy-switch').trigger('click')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <Switch modelValue={false} size="small" />)
    expect(wrapper.find('.easy-switch').classes()).toContain('easy-switch--small')
  })

  it('自定义 activeValue 与 inactiveValue', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <Switch modelValue="off" activeValue="on" inactiveValue="off" onChange={onChange} />)
    expect(wrapper.find('.easy-switch').classes()).not.toContain('is-checked')
    await wrapper.find('.easy-switch').trigger('click')
    expect(onChange).toHaveBeenCalledWith('on')
  })

  it('activeText/inactiveText 渲染文本', () => {
    const wrapper = mount(() => <Switch modelValue activeText="开" inactiveText="关" />)
    expect(wrapper.find('.easy-switch__text').text()).toBe('开')
  })

  it('选中时应用 activeColor 背景色', () => {
    const wrapper = mount(() => <Switch modelValue activeColor="#ff0000" />)
    const core = wrapper.find('.easy-switch__core').element as HTMLElement
    expect(core.style.background).toBe('rgb(255, 0, 0)')
  })
})
