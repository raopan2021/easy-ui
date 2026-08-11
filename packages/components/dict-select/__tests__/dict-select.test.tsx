import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DictSelect from '../src/dict-select.vue'

const stubs = {
  'easy-select': {
    name: 'EasySelect',
    props: ['modelValue', 'options', 'placeholder', 'multiple', 'clearable', 'disabled'],
    emits: ['update:modelValue', 'change', 'clear'],
    template: [
      '<div class="easy-select-stub">',
      '<span class="stub-options">{{ options.map(o => o.labelName).join(",") }}</span>',
      '</div>',
    ].join(''),
  },
}

function selectStub(wrapper: any) {
  return wrapper.findComponent({ name: 'EasySelect' })
}

async function flushDict() {
  vi.advanceTimersByTime(400)
  await nextTick()
  await nextTick()
}

describe('DictSelect 字典选择器组件', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('加载后渲染字典选项（labelName 显示）', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictSelect dictType="user_status" />, { global: { stubs } })
    await flushDict()
    expect(wrapper.find('.easy-select-stub').exists()).toBe(true)
    expect(wrapper.find('.stub-options').text()).toContain('正常')
    expect(wrapper.find('.stub-options').text()).toContain('禁用')
  })

  it('通过 props 将 options 传给 EasySelect', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictSelect dictType="gender" />, { global: { stubs } })
    await flushDict()
    expect(wrapper.find('.stub-options').text()).toBe('男,女,未知')
  })

  it('未知 dictType 渲染空选项', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictSelect dictType="not_exist" />, { global: { stubs } })
    await flushDict()
    expect(wrapper.find('.stub-options').text()).toBe('')
  })

  it('无 dictType 不触发加载', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictSelect dictType="" />, { global: { stubs } })
    vi.advanceTimersByTime(400)
    await nextTick()
    expect(wrapper.find('.easy-select-stub').exists()).toBe(true)
  })

  it('disabled 透传给 EasySelect', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictSelect dictType="user_status" disabled />, { global: { stubs } })
    await flushDict()
    expect(selectStub(wrapper).props('disabled')).toBe(true)
  })

  it('multiple 透传给 EasySelect', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictSelect dictType="user_status" multiple />, { global: { stubs } })
    await flushDict()
    expect(selectStub(wrapper).props('multiple')).toBe(true)
  })

  it('placeholder 透传给 EasySelect', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictSelect dictType="user_status" placeholder="请选择状态" />, { global: { stubs } })
    await flushDict()
    expect(selectStub(wrapper).props('placeholder')).toBe('请选择状态')
  })

  it('option 携带 disabled 字段', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictSelect dictType="order_status" />, { global: { stubs } })
    await flushDict()
    const options = selectStub(wrapper).props('options') as any[]
    const refunding = options.find((o: any) => o.labelName === '退款中')
    expect(refunding.disabled).toBe(true)
  })

  it('暴露 reload 与 dictList', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DictSelect, { props: { dictType: 'user_status' }, global: { stubs } })
    await flushDict()
    const vm = wrapper.vm as unknown as { reload: () => Promise<void>, dictList: any[] }
    expect(typeof vm.reload).toBe('function')
    expect(Array.isArray(vm.dictList)).toBe(true)
  })
})
