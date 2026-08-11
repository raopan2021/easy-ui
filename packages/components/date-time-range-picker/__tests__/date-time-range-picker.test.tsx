import { mount } from '@vue/test-utils'
import DateTimeRangePicker from '../src/date-time-range-picker.vue'

const stubs = {
  'easy-date-time-picker': {
    name: 'EasyDateTimePicker',
    props: ['modelValue', 'placeholder', 'disabled', 'readonly', 'clearable', 'format', 'valueFormat', 'size'],
    emits: ['update:modelValue'],
    template: '<input class="easy-dtp-stub" :placeholder="placeholder" :value="modelValue" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}

describe('DateTimeRangePicker 日期时间范围选择器组件', () => {
  it('渲染范围选择器容器', () => {
    const wrapper = mount(() => <DateTimeRangePicker />, { global: { stubs } })
    expect(wrapper.find('.easy-date-time-range-picker').exists()).toBe(true)
  })

  it('渲染开始与结束两个选择器', () => {
    const wrapper = mount(() => <DateTimeRangePicker />, { global: { stubs } })
    expect(wrapper.findAll('.easy-dtp-stub').length).toBe(2)
  })

  it('渲染分隔符', () => {
    const wrapper = mount(() => <DateTimeRangePicker />, { global: { stubs } })
    expect(wrapper.find('.easy-date-time-range-picker__separator').text()).toBe('至')
  })

  it('默认 placeholder 为开始/结束时间', () => {
    const wrapper = mount(() => <DateTimeRangePicker />, { global: { stubs } })
    const inputs = wrapper.findAll('.easy-dtp-stub')
    expect(inputs[0].attributes('placeholder')).toBe('开始时间')
    expect(inputs[1].attributes('placeholder')).toBe('结束时间')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <DateTimeRangePicker size="small" />, { global: { stubs } })
    expect(wrapper.find('.easy-date-time-range-picker').classes()).toContain('easy-date-time-range-picker--small')
  })

  it('disabled 应用到类名', () => {
    const wrapper = mount(() => <DateTimeRangePicker disabled />, { global: { stubs } })
    expect(wrapper.find('.easy-date-time-range-picker').classes()).toContain('is-disabled')
  })

  it('修改开始值触发 update:start', async () => {
    const onUpdateStart = vi.fn()
    const wrapper = mount(() => <DateTimeRangePicker onUpdate:start={onUpdateStart} />, { global: { stubs } })
    await wrapper.find('.easy-dtp-stub').setValue('2024-01-01 09:00')
    expect(onUpdateStart).toHaveBeenCalledWith('2024-01-01 09:00')
  })

  it('修改结束值触发 update:end', async () => {
    const onUpdateEnd = vi.fn()
    const wrapper = mount(() => <DateTimeRangePicker onUpdate:end={onUpdateEnd} />, { global: { stubs } })
    await wrapper.findAll('.easy-dtp-stub')[1]!.setValue('2024-12-31 18:00')
    expect(onUpdateEnd).toHaveBeenCalledWith('2024-12-31 18:00')
  })

  it('change 事件携带范围值', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <DateTimeRangePicker onChange={onChange} />, { global: { stubs } })
    await wrapper.find('.easy-dtp-stub').setValue('2024-01-01 09:00')
    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0]![0]).toEqual({ start: '2024-01-01 09:00', end: '' })
  })
})
