import { mount } from '@vue/test-utils'
import Input from '../src/input.vue'

describe('Input 输入框组件', () => {
  it('渲染基础输入框', () => {
    const wrapper = mount(() => <Input modelValue="文本" />)
    expect(wrapper.find('.easy-input').exists()).toBe(true)
    expect(wrapper.find('input.easy-input__inner').exists()).toBe(true)
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('文本')
  })

  it('placeholder 应用到输入框', () => {
    const wrapper = mount(() => <Input placeholder="请输入" />)
    expect((wrapper.find('input').element as HTMLInputElement).placeholder).toBe('请输入')
  })

  it('type 应用到输入框类型', () => {
    const wrapper = mount(() => <Input type="password" modelValue="123" />)
    expect((wrapper.find('input').element as HTMLInputElement).type).toBe('password')
  })

  it('disabled 禁用输入框', () => {
    const wrapper = mount(() => <Input disabled />)
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
    expect(wrapper.find('.easy-input').classes()).toContain('is-disabled')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <Input size="small" />)
    expect(wrapper.find('.easy-input').classes()).toContain('easy-input--small')
  })

  it('input 事件触发 update:modelValue', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Input modelValue="" onUpdate:modelValue={onUpdate} />)
    await wrapper.find('input').setValue('新值')
    expect(onUpdate).toHaveBeenCalledWith('新值')
  })

  it('change 事件在 blur 时触发', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <Input modelValue="a" onChange={onChange} />)
    await wrapper.find('input').trigger('blur')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('type=textarea 渲染文本域', () => {
    const wrapper = mount(() => <Input type="textarea" modelValue="多行" />)
    expect(wrapper.find('textarea.easy-input__inner').exists()).toBe(true)
  })

  it('clearable 且非空时渲染清除按钮', async () => {
    const wrapper = mount(() => <Input clearable modelValue="可清除" />)
    expect(wrapper.find('.easy-input__clear').exists()).toBe(true)
  })

  it('clearable 且空值时不渲染清除按钮', () => {
    const wrapper = mount(() => <Input clearable modelValue="" />)
    expect(wrapper.find('.easy-input__clear').exists()).toBe(false)
  })

  it('点击清除按钮触发 clear 并清空', async () => {
    const onClear = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Input clearable modelValue="x" onClear={onClear} onUpdate:modelValue={onUpdate} />)
    await wrapper.find('.easy-input__clear').trigger('click')
    expect(onClear).toHaveBeenCalled()
    expect(onUpdate).toHaveBeenCalledWith('')
  })

  it('password 类型点击切换可见性', async () => {
    const wrapper = mount(() => <Input type="password" modelValue="123" />)
    expect((wrapper.find('input').element as HTMLInputElement).type).toBe('password')
    await wrapper.find('.easy-input__password-toggle').trigger('click')
    expect((wrapper.find('input').element as HTMLInputElement).type).toBe('text')
  })

  it('prefix 渲染前置文本', () => {
    const wrapper = mount(() => <Input prefix="https://" />)
    expect(wrapper.find('.easy-input__prepend-text').text()).toBe('https://')
  })

  it('prefixIcon 渲染前缀图标区域', () => {
    const wrapper = mount(() => <Input prefixIcon="el:Search" />)
    expect(wrapper.find('.easy-input__prefix').exists()).toBe(true)
  })

  it('toUpperCase 输入自动转大写', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Input toUpperCase modelValue="" onUpdate:modelValue={onUpdate} />)
    await wrapper.find('input').setValue('abc')
    expect(onUpdate).toHaveBeenCalledWith('ABC')
  })

  it('expose focus/blur/select 方法', () => {
    const wrapper = mount(Input, { props: {} })
    const vm = wrapper.vm as unknown as { focus: () => void, blur: () => void, select: () => void }
    expect(typeof vm.focus).toBe('function')
    expect(typeof vm.blur).toBe('function')
    expect(typeof vm.select).toBe('function')
  })
})
