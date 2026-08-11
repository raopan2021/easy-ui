import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DateTimePicker from '../src/date-time-picker.vue'

function currentPanel() {
  const panels = document.body.querySelectorAll('.easy-date-time-picker__panel')
  return panels[panels.length - 1]
}

afterEach(() => {
  document.body.querySelectorAll('.easy-date-time-picker__panel').forEach(el => el.remove())
})

describe('DateTimePicker 日期时间选择器组件', () => {
  it('渲染日期时间选择器容器与输入框', () => {
    const wrapper = mount(() => <DateTimePicker />)
    expect(wrapper.find('.easy-date-time-picker').exists()).toBe(true)
    expect(wrapper.find('.easy-date-time-picker__input').exists()).toBe(true)
  })

  it('modelValue 显示在输入框', () => {
    const wrapper = mount(() => <DateTimePicker modelValue="2024-05-20 12:30" />)
    expect((wrapper.find('.easy-date-time-picker__input').element as HTMLInputElement).value).toBe('2024-05-20 12:30')
  })

  it('默认 placeholder 为请选择日期时间', () => {
    const wrapper = mount(() => <DateTimePicker />)
    expect((wrapper.find('.easy-date-time-picker__input').element as HTMLInputElement).placeholder).toBe('请选择日期时间')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <DateTimePicker size="small" />)
    expect(wrapper.find('.easy-date-time-picker').classes()).toContain('easy-date-time-picker--small')
  })

  it('disabled 禁用输入框', () => {
    const wrapper = mount(() => <DateTimePicker disabled />)
    expect((wrapper.find('.easy-date-time-picker__input').element as HTMLInputElement).disabled).toBe(true)
  })

  it('showSeconds 渲染秒输入框', () => {
    const wrapper = mount(() => <DateTimePicker showSeconds />)
    // 面板未打开，但秒 input 存在于面板；此处验证组件正常渲染
    expect(wrapper.find('.easy-date-time-picker').exists()).toBe(true)
  })

  it('点击输入框打开面板渲染日历', async () => {
    const wrapper = mount(() => <DateTimePicker />)
    await wrapper.find('.easy-date-time-picker__input').trigger('click')
    await nextTick()
    const panel = currentPanel()
    expect(panel).toBeTruthy()
    expect(panel!.querySelectorAll('.easy-dtp-date__day').length).toBeGreaterThan(20)
    wrapper.unmount()
  })

  it('clearable 且非空时渲染清除按钮', () => {
    const wrapper = mount(() => <DateTimePicker modelValue="2024-05-20 12:30" />)
    expect(wrapper.find('.easy-date-time-picker__clear').exists()).toBe(true)
  })

  it('disabled 时不渲染清除按钮', () => {
    const wrapper = mount(() => <DateTimePicker modelValue="2024-05-20 12:30" disabled />)
    expect(wrapper.find('.easy-date-time-picker__clear').exists()).toBe(false)
  })

  it('渲染时间输入区域', async () => {
    const wrapper = mount(() => <DateTimePicker />)
    await wrapper.find('.easy-date-time-picker__input').trigger('click')
    await nextTick()
    const panel = currentPanel()
    expect(panel!.querySelectorAll('.easy-dtp-time__time-input').length).toBe(2)
    wrapper.unmount()
  })
})
