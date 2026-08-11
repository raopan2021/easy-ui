import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EasyInput from '../../input/src/input.vue'
import InputRange from '../src/input-range.vue'

describe('InputRange.vue', () => {
  test('render default structure', () => {
    const wrapper = mount(() => <InputRange />)
    expect(wrapper.find('.easy-input-range').exists()).toBe(true)
    expect(wrapper.find('.easy-input-range__start').exists()).toBe(true)
    expect(wrapper.find('.easy-input-range__end').exists()).toBe(true)
    expect(wrapper.find('.easy-input-range__separator').text()).toBe('~')
    // 两个输入框 + 默认占位符
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(2)
  })

  test('custom separator and placeholder', () => {
    const wrapper = mount(() => (
      <InputRange
        separator="至"
        startPlaceholder="最小"
        endPlaceholder="最大"
      />
    ))
    expect(wrapper.find('.easy-input-range__separator').text()).toBe('至')
    const inputs = wrapper.findAll('input')
    expect((inputs[0]!.element as HTMLInputElement).placeholder).toBe('最小')
    expect((inputs[1]!.element as HTMLInputElement).placeholder).toBe('最大')
  })

  test('size class and disabled', () => {
    const wrapper = mount(() => <InputRange size="small" disabled />)
    expect(wrapper.find('.easy-input-range').classes()).toContain('easy-input-range--small')
    expect(wrapper.find('.easy-input-range').classes()).toContain('is-disabled')
    const inputs = wrapper.findAll('input')
    for (const input of inputs)
      expect((input.element as HTMLInputElement).disabled).toBe(true)
  })

  test('initial start and end values', () => {
    const wrapper = mount(() => <InputRange start={1} end={10} />)
    const inputs = wrapper.findAll('input')
    expect((inputs[0]!.element as HTMLInputElement).value).toBe('1')
    expect((inputs[1]!.element as HTMLInputElement).value).toBe('10')
  })

  test('start input change calls onUpdate:start and onChange', async () => {
    const onUpdateStart = vi.fn()
    const onChange = vi.fn()
    const wrapper = mount(() => (
      <InputRange start={0} end={5} onUpdate:start={onUpdateStart} onChange={onChange} />
    ))
    const startInput = wrapper.find('.easy-input-range__start input')
    await startInput.setValue('3')
    await nextTick()

    expect(onUpdateStart).toHaveBeenCalledWith('3')
    expect(onChange).toHaveBeenCalledWith({ start: '3', end: 5 })
  })

  test('end input change calls onUpdate:end and onChange', async () => {
    const onUpdateEnd = vi.fn()
    const onChange = vi.fn()
    const wrapper = mount(() => (
      <InputRange start={1} end={0} onUpdate:end={onUpdateEnd} onChange={onChange} />
    ))
    const endInput = wrapper.find('.easy-input-range__end input')
    await endInput.setValue('8')
    await nextTick()

    expect(onUpdateEnd).toHaveBeenCalledWith('8')
    expect(onChange).toHaveBeenCalledWith({ start: 1, end: '8' })
  })

  test('EasyInput subcomponent update:modelValue triggers start handlers', async () => {
    const onUpdateStart = vi.fn()
    const onChange = vi.fn()
    const wrapper = mount(() => (
      <InputRange start={0} end={5} onUpdate:start={onUpdateStart} onChange={onChange} />
    ))
    const inputs = wrapper.findAllComponents(EasyInput)
    expect(inputs.length).toBe(2)
    inputs[0]!.vm.$emit('update:modelValue', '9')
    await nextTick()
    expect(onUpdateStart).toHaveBeenCalledWith('9')
    expect(onChange).toHaveBeenCalledWith({ start: '9', end: 5 })
  })

  test('EasyInput subcomponent update:modelValue triggers end handlers', async () => {
    const onUpdateEnd = vi.fn()
    const onChange = vi.fn()
    const wrapper = mount(() => (
      <InputRange start={1} end={0} onUpdate:end={onUpdateEnd} onChange={onChange} />
    ))
    const inputs = wrapper.findAllComponents(EasyInput)
    inputs[1]!.vm.$emit('update:modelValue', '6')
    await nextTick()
    expect(onUpdateEnd).toHaveBeenCalledWith('6')
    expect(onChange).toHaveBeenCalledWith({ start: 1, end: '6' })
  })
})
