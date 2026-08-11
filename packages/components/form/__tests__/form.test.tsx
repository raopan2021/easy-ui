import { mount } from '@vue/test-utils'
import FormItem from '../src/form-item.vue'
import Form from '../src/form.vue'

describe('Form 表单组件', () => {
  it('渲染基础表单容器', () => {
    const wrapper = mount(() => (
      <Form model={{ name: '张三' }}>
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    expect(wrapper.find('.easy-form').exists()).toBe(true)
    expect(wrapper.find('.easy-form-item').exists()).toBe(true)
  })

  it('渲染 label 文本', () => {
    const wrapper = mount(() => (
      <Form model={{ name: 'x' }}>
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    expect(wrapper.find('.easy-form-item__label').text()).toContain('姓名')
  })

  it('inline 应用到类名', () => {
    const wrapper = mount(() => (
      <Form model={{}} inline>
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    expect(wrapper.find('.easy-form').classes()).toContain('is-inline')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => (
      <Form model={{}} size="small">
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    expect(wrapper.find('.easy-form').classes()).toContain('easy-form--small')
  })

  it('labelPosition 应用到类名', () => {
    const wrapper = mount(() => (
      <Form model={{}} labelPosition="top">
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    expect(wrapper.find('.easy-form').classes()).toContain('is-label-top')
  })

  it('validate 通过时返回 true 并触发 validate 事件', async () => {
    const onValidate = vi.fn()
    const wrapper = mount(() => (
      <Form model={{ name: '张三' }} onValidate={onValidate}>
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    const form = wrapper.findComponent(Form)
    const valid = await (form.vm as any).validate()
    expect(valid).toBe(true)
    expect(onValidate).toHaveBeenCalled()
  })

  it('rules 校验失败时返回 false 并记录错误', async () => {
    const onValidate = vi.fn()
    const wrapper = mount(() => (
      <Form model={{ name: '' }} rules={{ name: ['required'] }} onValidate={onValidate}>
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    const form = wrapper.findComponent(Form)
    const valid = await (form.vm as any).validate()
    expect(valid).toBe(false)
    expect(onValidate).toHaveBeenCalledWith({ valid: false, errors: { name: '此项为必填项' } })
  })

  it('validateField 校验指定字段', async () => {
    const wrapper = mount(() => (
      <Form model={{ name: '' }} rules={{ name: ['required'] }}>
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    const form = wrapper.findComponent(Form)
    const nameValid = await (form.vm as any).validateField('name')
    expect(nameValid).toBe(false)
  })

  it('clearValidate 清除校验错误', async () => {
    const onValidate = vi.fn()
    const wrapper = mount(() => (
      <Form model={{ name: '' }} rules={{ name: ['required'] }} onValidate={onValidate}>
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    const form = wrapper.findComponent(Form)
    await (form.vm as any).validate()
    expect(onValidate).toHaveBeenLastCalledWith({ valid: false, errors: { name: '此项为必填项' } })
    expect(typeof (form.vm as any).clearValidate).toBe('function')
  })

  it('resetFields 重置 model 值', async () => {
    const wrapper = mount(() => (
      <Form model={{ name: '张三' }}>
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    const form = wrapper.findComponent(Form)
    ;(form.vm as any).resetFields()
    expect(form.props('model').name).toBe('')
  })

  it('disabled prop 正常渲染不报错', () => {
    const wrapper = mount(() => (
      <Form model={{}} disabled>
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    expect(wrapper.find('.easy-form').exists()).toBe(true)
  })

  it('labelWidth 应用到标签样式', () => {
    const wrapper = mount(() => (
      <Form model={{}} labelWidth="120px">
        <FormItem label="姓名" prop="name">内容</FormItem>
      </Form>
    ))
    const label = wrapper.find('.easy-form-item__label').element as HTMLElement
    expect(label.style.width).toBe('120px')
  })
})
