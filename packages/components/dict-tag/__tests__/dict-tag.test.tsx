import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DictTag from '../src/dict-tag.vue'

async function flushDict() {
  // 等待 fetchDictList 的 300ms 延迟
  vi.advanceTimersByTime(400)
  await nextTick()
  await nextTick()
}

describe('DictTag 字典标签组件', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('渲染单值对应的字典标签', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictTag dictType="user_status" value="1" />)
    await flushDict()
    expect(wrapper.find('.easy-tag').exists()).toBe(true)
    expect(wrapper.find('.easy-tag__text').text()).toBe('正常')
    expect(wrapper.find('.easy-tag').classes()).toContain('easy-tag--success')
  })

  it('多选模式渲染多个标签', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictTag dictType="user_status" value={['1', '2']} multiple />)
    await flushDict()
    const tags = wrapper.findAll('.easy-tag')
    expect(tags.length).toBe(2)
    expect(tags[0].find('.easy-tag__text').text()).toBe('正常')
    expect(tags[1].find('.easy-tag__text').text()).toBe('禁用')
  })

  it('逗号拼接字符串多选渲染多个标签', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictTag dictType="user_status" value="1,2" multiple />)
    await flushDict()
    expect(wrapper.findAll('.easy-tag').length).toBe(2)
  })

  it('无匹配项时显示降级原始值', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictTag dictType="user_status" value="999" />)
    await flushDict()
    expect(wrapper.find('.easy-dict-tag__fallback').text()).toBe('999')
  })

  it('value 为空时不渲染标签', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictTag dictType="user_status" value="" />)
    await flushDict()
    expect(wrapper.find('.easy-tag').exists()).toBe(false)
  })

  it('自定义 color 应用样式', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictTag dictType="priority" value="high" />)
    await flushDict()
    const tag = wrapper.find('.easy-tag').element as HTMLElement
    expect(tag.style.borderColor).toContain('255')
  })

  it('effect=dark 应用到类名', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictTag dictType="user_status" value="1" effect="dark" />)
    await flushDict()
    expect(wrapper.find('.easy-tag').classes()).toContain('easy-tag--dark')
  })

  it('size 应用到类名', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictTag dictType="user_status" value="1" size="small" />)
    await flushDict()
    expect(wrapper.find('.easy-tag').classes()).toContain('easy-tag--small')
  })

  it('round 应用圆角类名', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <DictTag dictType="user_status" value="1" round />)
    await flushDict()
    expect(wrapper.find('.easy-tag').classes()).toContain('is-round')
  })
})
