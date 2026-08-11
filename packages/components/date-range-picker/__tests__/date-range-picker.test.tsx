import { mount } from '@vue/test-utils'
import DateRangePicker from '../src/date-range-picker.vue'

const stubs = {
  'easy-date-picker': {
    name: 'EasyDatePicker',
    props: ['modelValue', 'placeholder', 'disabled', 'readonly', 'clearable', 'format', 'valueFormat', 'size'],
    emits: ['update:modelValue'],
    template: '<input class="easy-date-picker-stub" :placeholder="placeholder" :value="modelValue" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}

describe('DateRangePicker 日期范围选择器组件', () => {
  it('渲染范围选择器容器', () => {
    const wrapper = mount(() => <DateRangePicker />, { global: { stubs } })
    expect(wrapper.find('.easy-date-range-picker').exists()).toBe(true)
  })

  it('渲染开始与结束两个日期选择器', () => {
    const wrapper = mount(() => <DateRangePicker />, { global: { stubs } })
    expect(wrapper.findAll('.easy-date-picker-stub').length).toBe(2)
  })

  it('渲染分隔符', () => {
    const wrapper = mount(() => <DateRangePicker />, { global: { stubs } })
    expect(wrapper.find('.easy-date-range-picker__separator').text()).toBe('至')
  })

  it('默认 placeholder 为开始/结束日期', () => {
    const wrapper = mount(() => <DateRangePicker />, { global: { stubs } })
    const inputs = wrapper.findAll('.easy-date-picker-stub')
    expect(inputs[0].attributes('placeholder')).toBe('开始日期')
    expect(inputs[1].attributes('placeholder')).toBe('结束日期')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <DateRangePicker size="small" />, { global: { stubs } })
    expect(wrapper.find('.easy-date-range-picker').classes()).toContain('easy-date-range-picker--small')
  })

  it('disabled 应用到类名', () => {
    const wrapper = mount(() => <DateRangePicker disabled />, { global: { stubs } })
    expect(wrapper.find('.easy-date-range-picker').classes()).toContain('is-disabled')
  })

  it('自定义分隔符', () => {
    const wrapper = mount(() => <DateRangePicker separator="~" />, { global: { stubs } })
    expect(wrapper.find('.easy-date-range-picker__separator').text()).toBe('~')
  })

  it('修改开始日期触发 update:start 与 change', async () => {
    const onUpdateStart = vi.fn()
    const onChange = vi.fn()
    const wrapper = mount(() => (
      <DateRangePicker onUpdate:start={onUpdateStart} onChange={onChange} />
    ), { global: { stubs } })
    await wrapper.find('.easy-date-picker-stub').setValue('2024-01-01')
    expect(onUpdateStart).toHaveBeenCalledWith('2024-01-01')
    expect(onChange).toHaveBeenCalledWith({ start: '2024-01-01', end: '' })
  })

  it('修改结束日期触发 update:end 与 change', async () => {
    const onUpdateEnd = vi.fn()
    const onChange = vi.fn()
    const wrapper = mount(() => (
      <DateRangePicker onUpdate:end={onUpdateEnd} onChange={onChange} />
    ), { global: { stubs } })
    await wrapper.findAll('.easy-date-picker-stub')[1]!.setValue('2024-12-31')
    expect(onUpdateEnd).toHaveBeenCalledWith('2024-12-31')
    expect(onChange).toHaveBeenCalledWith({ start: '', end: '2024-12-31' })
  })
})
