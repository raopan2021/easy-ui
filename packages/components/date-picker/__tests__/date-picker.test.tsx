import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DatePicker from '../src/date-picker.vue'

function currentPanel() {
  const panels = document.body.querySelectorAll('.easy-date-picker__panel')
  return panels[panels.length - 1]!
}

afterEach(() => {
  // 清理可能残留的 Teleport 面板
  document.body.querySelectorAll('.easy-date-picker__panel').forEach(el => el.remove())
})

describe('DatePicker 日期选择器组件', () => {
  it('渲染日期选择器容器与输入框', () => {
    const wrapper = mount(() => <DatePicker />)
    expect(wrapper.find('.easy-date-picker').exists()).toBe(true)
    expect(wrapper.find('.easy-date-picker__input').exists()).toBe(true)
  })

  it('modelValue 按 format 显示', () => {
    const wrapper = mount(() => <DatePicker modelValue="2024-05-20" />)
    expect((wrapper.find('.easy-date-picker__input').element as HTMLInputElement).value).toBe('2024-05-20')
  })

  it('自定义 format 应用到显示', () => {
    const wrapper = mount(() => <DatePicker modelValue="2024-05-20" format="YYYY/MM/DD" />)
    expect((wrapper.find('.easy-date-picker__input').element as HTMLInputElement).value).toBe('2024/05/20')
  })

  it('placeholder 应用到输入框', () => {
    const wrapper = mount(() => <DatePicker placeholder="选择日期" />)
    expect((wrapper.find('.easy-date-picker__input').element as HTMLInputElement).placeholder).toBe('选择日期')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <DatePicker size="small" />)
    expect(wrapper.find('.easy-date-picker').classes()).toContain('easy-date-picker--small')
  })

  it('disabled 禁用输入框', () => {
    const wrapper = mount(() => <DatePicker disabled />)
    expect((wrapper.find('.easy-date-picker__input').element as HTMLInputElement).disabled).toBe(true)
    expect(wrapper.find('.easy-date-picker').classes()).toContain('is-disabled')
  })

  it('点击输入框打开日期面板', async () => {
    const wrapper = mount(() => <DatePicker />)
    await wrapper.find('.easy-date-picker__input').trigger('click')
    await nextTick()
    const panel = currentPanel()
    expect(panel).toBeTruthy()
    expect(panel.querySelectorAll('.easy-date-panel__day').length).toBeGreaterThan(20)
    wrapper.unmount()
  })

  it('点击日期触发 update:modelValue', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <DatePicker onUpdate:modelValue={onUpdate} />)
    await wrapper.find('.easy-date-picker__input').trigger('click')
    await nextTick()
    const currentDay = currentPanel().querySelector('.easy-date-panel__day:not(.is-other)') as HTMLElement
    currentDay.click()
    await nextTick()
    expect(onUpdate).toHaveBeenCalled()
    expect(typeof onUpdate.mock.calls[0]![0]).toBe('string')
    wrapper.unmount()
  })

  it('clearable 且非空时渲染清除按钮并清空', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <DatePicker modelValue="2024-05-20" onUpdate:modelValue={onUpdate} />)
    const clear = wrapper.find('.easy-date-picker__clear')
    expect(clear.exists()).toBe(true)
    await clear.trigger('click')
    expect(onUpdate).toHaveBeenCalledWith('')
    wrapper.unmount()
  })

  it('disabled 时不渲染清除按钮', () => {
    const wrapper = mount(() => <DatePicker modelValue="2024-05-20" disabled />)
    expect(wrapper.find('.easy-date-picker__clear').exists()).toBe(false)
  })

  it('type=year 打开面板显示年份', async () => {
    const wrapper = mount(() => <DatePicker type="year" />)
    await wrapper.find('.easy-date-picker__input').trigger('click')
    await nextTick()
    const panel = currentPanel()
    expect(panel).toBeTruthy()
    expect(panel.querySelectorAll('.easy-date-panel__year-cell').length).toBe(12)
    wrapper.unmount()
  })

  it('type=month 打开面板显示月份', async () => {
    const wrapper = mount(() => <DatePicker type="month" />)
    await wrapper.find('.easy-date-picker__input').trigger('click')
    await nextTick()
    const panel = currentPanel()
    expect(panel).toBeTruthy()
    expect(panel.querySelectorAll('.easy-date-panel__month-cell').length).toBe(12)
    wrapper.unmount()
  })
})
