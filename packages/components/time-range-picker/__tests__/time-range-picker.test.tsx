import { mount } from '@vue/test-utils'
import TimeRangePicker from '../src/time-range-picker.vue'

const stubs = {
  'easy-time-picker': {
    name: 'EasyTimePicker',
    props: ['modelValue', 'placeholder', 'disabled', 'readonly', 'clearable', 'format', 'valueFormat', 'size'],
    emits: ['update:modelValue'],
    template: '<input class="easy-time-picker-stub" :placeholder="placeholder" :value="modelValue" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}

describe('TimeRangePicker 时间范围选择器组件', () => {
  it('渲染范围选择器容器', () => {
    const wrapper = mount(() => <TimeRangePicker />, { global: { stubs } })
    expect(wrapper.find('.easy-time-range-picker').exists()).toBe(true)
  })

  it('渲染开始与结束两个时间选择器', () => {
    const wrapper = mount(() => <TimeRangePicker />, { global: { stubs } })
    expect(wrapper.findAll('.easy-time-picker-stub').length).toBe(2)
  })

  it('渲染分隔符', () => {
    const wrapper = mount(() => <TimeRangePicker />, { global: { stubs } })
    expect(wrapper.find('.easy-time-range-picker__separator').text()).toBe('至')
  })

  it('默认 placeholder 为开始/结束时间', () => {
    const wrapper = mount(() => <TimeRangePicker />, { global: { stubs } })
    const inputs = wrapper.findAll('.easy-time-picker-stub')
    expect(inputs[0].attributes('placeholder')).toBe('开始时间')
    expect(inputs[1].attributes('placeholder')).toBe('结束时间')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <TimeRangePicker size="small" />, { global: { stubs } })
    expect(wrapper.find('.easy-time-range-picker').classes()).toContain('easy-time-range-picker--small')
  })

  it('disabled 应用到类名', () => {
    const wrapper = mount(() => <TimeRangePicker disabled />, { global: { stubs } })
    expect(wrapper.find('.easy-time-range-picker').classes()).toContain('is-disabled')
  })

  it('修改开始时间触发 update:start', async () => {
    const onUpdateStart = vi.fn()
    const wrapper = mount(() => <TimeRangePicker onUpdate:start={onUpdateStart} />, { global: { stubs } })
    await wrapper.find('.easy-time-picker-stub').setValue('09:00')
    expect(onUpdateStart).toHaveBeenCalledWith('09:00')
  })

  it('修改结束时间触发 update:end', async () => {
    const onUpdateEnd = vi.fn()
    const wrapper = mount(() => <TimeRangePicker onUpdate:end={onUpdateEnd} />, { global: { stubs } })
    await wrapper.findAll('.easy-time-picker-stub')[1]!.setValue('18:00')
    expect(onUpdateEnd).toHaveBeenCalledWith('18:00')
  })

  it('change 事件携带范围值', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <TimeRangePicker onChange={onChange} />, { global: { stubs } })
    await wrapper.find('.easy-time-picker-stub').setValue('09:00')
    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0]![0]).toEqual({ start: '09:00', end: '' })
  })
})
