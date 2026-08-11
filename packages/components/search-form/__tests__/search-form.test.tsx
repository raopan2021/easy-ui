import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SearchForm from '../src/search-form.vue'

const stubs = {
  'easy-form': {
    name: 'EasyForm',
    props: ['model', 'rules', 'inline'],
    template: '<form class="easy-form-stub"><slot/></form>',
    methods: {
      validate: () => Promise.resolve(true),
      resetFields: () => {},
    },
  },
  'easy-form-item': {
    name: 'EasyFormItem',
    props: ['label', 'prop'],
    template: '<div class="easy-form-item-stub"><span class="stub-label">{{ label }}</span><div class="stub-control"><slot/></div></div>',
  },
  'easy-button': {
    name: 'EasyButton',
    props: ['type', 'size', 'loading'],
    emits: ['click'],
    template: '<button class="easy-button-stub" @click="$emit(\'click\', $event)"><slot/></button>',
  },
  'easy-input': {
    name: 'EasyInput',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue', 'keyup'],
    template: '<input class="easy-input-stub" :placeholder="placeholder" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  'easy-select': { name: 'EasySelect', props: ['modelValue', 'options'], template: '<span class="easy-select-stub"/>' },
  'easy-cascader': { name: 'EasyCascader', template: '<span class="easy-cascader-stub"/>' },
  'easy-date-picker': { name: 'EasyDatePicker', template: '<span class="easy-date-picker-stub"/>' },
  'easy-date-range-picker': { name: 'EasyDateRangePicker', template: '<span class="easy-date-range-picker-stub"/>' },
  'easy-date-time-picker': { name: 'EasyDateTimePicker', template: '<span class="easy-date-time-picker-stub"/>' },
  'easy-date-time-range-picker': { name: 'EasyDateTimeRangePicker', template: '<span class="easy-date-time-range-picker-stub"/>' },
  'easy-time-picker': { name: 'EasyTimePicker', template: '<span class="easy-time-picker-stub"/>' },
  'easy-time-range-picker': { name: 'EasyTimeRangePicker', template: '<span class="easy-time-range-picker-stub"/>' },
  'easy-input-range': { name: 'EasyInputRange', template: '<span class="easy-input-range-stub"/>' },
  'easy-icon': { name: 'EasyIcon', template: '<span class="easy-icon-stub"/>' },
}

describe('SearchForm 搜索表单组件', () => {
  it('渲染搜索表单容器', () => {
    const wrapper = mount(() => <SearchForm items={[]} />, { global: { stubs } })
    expect(wrapper.find('.easy-search-form').exists()).toBe(true)
  })

  it('渲染输入型搜索项', () => {
    const items = [{ prop: 'keyword', label: '关键字', type: 'input' as const }]
    const wrapper = mount(() => <SearchForm items={items} />, { global: { stubs } })
    // FormItem 内的输入框 stub 已渲染
    expect(wrapper.find('.easy-input-stub').exists()).toBe(true)
  })

  it('渲染占位符为请输入+标签', () => {
    const items = [{ prop: 'name', label: '姓名', type: 'input' as const }]
    const wrapper = mount(() => <SearchForm items={items} />, { global: { stubs } })
    expect(wrapper.find('.easy-input-stub').attributes('placeholder')).toBe('请输入姓名')
  })

  it('渲染查询与重置按钮', () => {
    const wrapper = mount(() => <SearchForm items={[]} />, { global: { stubs } })
    const buttons = wrapper.findAll('.easy-button-stub')
    const text = buttons.map(b => b.text()).join(',')
    expect(text).toContain('查询')
    expect(text).toContain('重置')
  })

  it('自定义按钮文本', () => {
    const wrapper = mount(() => (
      <SearchForm items={[]} searchButtonText="搜索" resetButtonText="清空" />
    ), { global: { stubs } })
    const text = wrapper.findAll('.easy-button-stub').map(b => b.text()).join(',')
    expect(text).toContain('搜索')
    expect(text).toContain('清空')
  })

  it('输入值后点击查询触发 search 事件', async () => {
    const onSearch = vi.fn()
    const onUpdate = vi.fn()
    const items = [{ prop: 'keyword', label: '关键字', type: 'input' as const }]
    const wrapper = mount(() => (
      <SearchForm items={items} onSearch={onSearch} onUpdate:modelValue={onUpdate} />
    ), { global: { stubs } })
    await wrapper.find('.easy-input-stub').setValue('测试')
    await nextTick()
    const queryBtn = wrapper.findAll('.easy-button-stub').find(b => b.text().includes('查询'))!
    await queryBtn.trigger('click')
    await nextTick()
    expect(onSearch).toHaveBeenCalled()
    expect(onSearch.mock.calls[0]![0]).toHaveProperty('keyword', '测试')
    expect(onUpdate).toHaveBeenCalled()
  })

  it('hide 的 item 不渲染', () => {
    const items = [
      { prop: 'a', label: '显示', type: 'input' as const },
      { prop: 'b', label: '隐藏', type: 'input' as const, hide: true },
    ]
    const wrapper = mount(() => <SearchForm items={items} />, { global: { stubs } })
    expect(wrapper.findAll('.easy-input-stub').length).toBe(1)
  })

  it('inline=false 仍正常渲染', () => {
    const items = [{ prop: 'name', label: '姓名', type: 'input' as const }]
    const wrapper = mount(() => <SearchForm items={items} inline={false} />, { global: { stubs } })
    expect(wrapper.find('.easy-search-form').exists()).toBe(true)
  })

  it('select 类型渲染选择器', () => {
    const items = [
      { prop: 'status', label: '状态', type: 'select' as const, options: [{ label: '正常', value: '1' }] },
    ]
    const wrapper = mount(() => <SearchForm items={items} />, { global: { stubs } })
    expect(wrapper.find('.easy-select-stub').exists()).toBe(true)
  })

  it('type 省略时默认渲染输入框', () => {
    const items = [{ prop: 'name', label: '姓名' }]
    const wrapper = mount(() => <SearchForm items={items} />, { global: { stubs } })
    expect(wrapper.find('.easy-input-stub').exists()).toBe(true)
  })
})
