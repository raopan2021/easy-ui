import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TimePicker from '../src/time-picker.vue'

function currentPanel() {
  const panels = document.body.querySelectorAll('.easy-time-picker__panel')
  return panels[panels.length - 1]
}

afterEach(() => {
  document.body.querySelectorAll('.easy-time-picker__panel').forEach(el => el.remove())
})

describe('TimePicker 时间选择器组件', () => {
  it('渲染时间选择器容器与输入框', () => {
    const wrapper = mount(() => <TimePicker />)
    expect(wrapper.find('.easy-time-picker').exists()).toBe(true)
    expect(wrapper.find('.easy-time-picker__input').exists()).toBe(true)
  })

  it('modelValue 显示在输入框', () => {
    const wrapper = mount(() => <TimePicker modelValue="12:30" />)
    expect((wrapper.find('.easy-time-picker__input').element as HTMLInputElement).value).toBe('12:30')
  })

  it('默认 placeholder 为请选择时间', () => {
    const wrapper = mount(() => <TimePicker />)
    expect((wrapper.find('.easy-time-picker__input').element as HTMLInputElement).placeholder).toBe('请选择时间')
  })

  it('自定义 placeholder', () => {
    const wrapper = mount(() => <TimePicker placeholder="选择时刻" />)
    expect((wrapper.find('.easy-time-picker__input').element as HTMLInputElement).placeholder).toBe('选择时刻')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <TimePicker size="small" />)
    expect(wrapper.find('.easy-time-picker').classes()).toContain('easy-time-picker--small')
  })

  it('disabled 禁用输入框', () => {
    const wrapper = mount(() => <TimePicker disabled />)
    expect((wrapper.find('.easy-time-picker__input').element as HTMLInputElement).disabled).toBe(true)
  })

  it('showSeconds 显示秒滚动列', async () => {
    const wrapper = mount(() => <TimePicker showSeconds />)
    await wrapper.find('.easy-time-picker__input').trigger('click')
    await nextTick()
    const panel = currentPanel()
    expect(panel).toBeTruthy()
    // 时、分、秒共 3 列
    expect(panel!.querySelectorAll('.easy-time-panel__column').length).toBe(3)
    wrapper.unmount()
  })

  it('点击输入框打开时间面板', async () => {
    const wrapper = mount(() => <TimePicker />)
    await wrapper.find('.easy-time-picker__input').trigger('click')
    await nextTick()
    const panel = currentPanel()
    expect(panel).toBeTruthy()
    // 默认无秒：时(24) + 分(60) = 84
    expect(panel!.querySelectorAll('.easy-time-panel__item').length).toBe(84)
    wrapper.unmount()
  })

  it('选择小时并确定触发 update:modelValue', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <TimePicker onUpdate:modelValue={onUpdate} />)
    await wrapper.find('.easy-time-picker__input').trigger('click')
    await nextTick()
    const panel = currentPanel()
    const hourItem = panel!.querySelectorAll('.easy-time-panel__item')[0] as HTMLElement
    hourItem.click()
    await nextTick()
    // 点击确定按钮确认选择
    const confirmBtn = panel!.querySelector('.easy-time-panel__btn--primary') as HTMLElement
    confirmBtn.click()
    await nextTick()
    expect(onUpdate).toHaveBeenCalled()
    expect(typeof onUpdate.mock.calls[0]![0]).toBe('string')
    wrapper.unmount()
  })

  it('clearable 且非空时渲染清除按钮', () => {
    const wrapper = mount(() => <TimePicker modelValue="12:30" />)
    expect(wrapper.find('.easy-time-picker__clear').exists()).toBe(true)
  })

  it('disabled 时不渲染清除按钮', () => {
    const wrapper = mount(() => <TimePicker modelValue="12:30" disabled />)
    expect(wrapper.find('.easy-time-picker__clear').exists()).toBe(false)
  })
})
