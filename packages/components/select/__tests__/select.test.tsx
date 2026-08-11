import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Select from '../src/select.vue'

async function flushTimers() {
  // 等待组件的 setTimeout(0) 标签宽度计算完成
  await new Promise(resolve => setTimeout(resolve, 50))
  await nextTick()
}

const options = [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' },
]

describe('Select 选择器组件', () => {
  it('渲染基础选择器容器', () => {
    const wrapper = mount(() => <Select modelValue="1" options={options} />)
    expect(wrapper.find('.easy-select').exists()).toBe(true)
  })

  it('modelValue 对应显示选中标签', () => {
    const wrapper = mount(() => <Select modelValue="2" options={options} />)
    expect(wrapper.find('.easy-select__value').text()).toBe('选项二')
  })

  it('无匹配选项时显示原始值', () => {
    const wrapper = mount(() => <Select modelValue="99" options={options} />)
    expect(wrapper.find('.easy-select__value').text()).toBe('99')
  })

  it('无值时显示 placeholder', () => {
    const wrapper = mount(() => <Select modelValue="" options={options} placeholder="请选择" />)
    expect(wrapper.find('.easy-select__value').text()).toBe('请选择')
  })

  it('基础数组选项自动转换为对象', () => {
    const wrapper = mount(() => <Select modelValue="苹果" options={['苹果', '香蕉']} />)
    expect(wrapper.find('.easy-select__value').text()).toBe('苹果')
  })

  it('disabled 禁用选择器', () => {
    const wrapper = mount(() => <Select disabled options={options} />)
    expect(wrapper.find('.easy-select').classes()).toContain('is-disabled')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <Select size="small" options={options} />)
    expect(wrapper.find('.easy-select').classes()).toContain('easy-select--small')
  })

  it('点击打开下拉面板渲染选项', async () => {
    const wrapper = mount(() => <Select options={options} filterable={false} />)
    await wrapper.find('.easy-select__wrapper').trigger('click')
    await nextTick()
    const dropdown = document.body.querySelector('.easy-select__dropdown')
    expect(dropdown).toBeTruthy()
    expect(dropdown!.querySelectorAll('.easy-select__option').length).toBe(3)
    wrapper.unmount()
  })

  it('点击选项触发 change 并关闭面板', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(() => (
      <Select options={options} filterable={false} onChange={onChange} onUpdate:modelValue={onUpdate} />
    ))
    await wrapper.find('.easy-select__wrapper').trigger('click')
    await nextTick()
    const dropdowns = document.body.querySelectorAll('.easy-select__dropdown')
    const currentDropdown = dropdowns[dropdowns.length - 1]
    const firstOption = currentDropdown!.querySelectorAll('.easy-select__option')[0] as HTMLElement
    firstOption.click()
    await nextTick()
    expect(onChange).toHaveBeenCalledWith('1')
    expect(onUpdate).toHaveBeenCalledWith('1')
    wrapper.unmount()
  })

  it('选中项添加 is-selected 类名', async () => {
    const wrapper = mount(() => <Select modelValue="1" options={options} filterable={false} />)
    await wrapper.find('.easy-select__wrapper').trigger('click')
    await nextTick()
    const selected = document.body.querySelector('.easy-select__option.is-selected')
    expect(selected).toBeTruthy()
    wrapper.unmount()
  })

  it('禁用选项不可选中', async () => {
    const disabledOptions = [
      { label: '正常', value: '1' },
      { label: '禁用', value: '2', disabled: true },
    ]
    const onChange = vi.fn()
    const wrapper = mount(() => (
      <Select options={disabledOptions} filterable={false} onChange={onChange} />
    ))
    await wrapper.find('.easy-select__wrapper').trigger('click')
    await nextTick()
    const disabled = document.body.querySelector('.easy-select__option.is-disabled') as HTMLElement
    expect(disabled).toBeTruthy()
    disabled.click()
    await nextTick()
    expect(onChange).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('multiple 渲染多选标签容器', async () => {
    // jsdom 无真实布局，多选标签数量依赖宽度计算，仅验证容器存在
    const wrapper = mount(() => <Select multiple modelValue={['1', '2']} options={options} />)
    await flushTimers()
    expect(wrapper.find('.easy-select__tags').exists()).toBe(true)
  })

  it('clearable 且有值时渲染清除按钮', async () => {
    const onClear = vi.fn()
    const wrapper = mount(() => <Select modelValue="1" options={options} clearable onClear={onClear} />)
    const clear = wrapper.find('.easy-select__clear')
    expect(clear.exists()).toBe(true)
    await clear.trigger('click')
    expect(onClear).toHaveBeenCalled()
  })
})
