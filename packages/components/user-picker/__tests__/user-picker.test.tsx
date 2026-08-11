import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import UserPicker from '../src/user-picker.vue'

afterEach(() => {
  vi.useRealTimers()
})

async function flushLoad() {
  vi.advanceTimersByTime(400)
  await nextTick()
  await nextTick()
}

describe('UserPicker 用户选择器组件', () => {
  it('渲染用户选择器容器', () => {
    const wrapper = mount(() => <UserPicker />)
    expect(wrapper.find('.easy-user-picker').exists()).toBe(true)
  })

  it('单选模式渲染添加按钮与占位符', () => {
    const wrapper = mount(() => <UserPicker placeholder="请选择用户" />)
    expect(wrapper.find('.easy-user-picker__add').exists()).toBe(true)
    expect(wrapper.find('.easy-user-picker__add').text()).toContain('请选择用户')
  })

  it('modelValue id 对应渲染已选用户标签', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <UserPicker modelValue={[1]} />)
    await flushLoad()
    expect(wrapper.find('.easy-user-picker__tag').exists()).toBe(true)
    expect(wrapper.find('.easy-user-picker__name').text()).toBe('张三')
  })

  it('多选模式渲染多个已选用户标签', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <UserPicker modelValue={[1, 2]} multiple />)
    await flushLoad()
    expect(wrapper.findAll('.easy-user-picker__tag').length).toBe(2)
  })

  it('渲染已选用户姓名', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <UserPicker modelValue={[1]} />)
    await flushLoad()
    expect(wrapper.find('.easy-user-picker__name').text()).toBe('张三')
    // 无头像用户渲染姓名文本区域
    expect(wrapper.find('.easy-user-picker__avatar-text').exists()).toBe(true)
  })

  it('showExtra 渲染额外信息', async () => {
    vi.useFakeTimers()
    // extraKey 默认 department，mock 用户 id=1 属于技术部
    const wrapper = mount(() => <UserPicker modelValue={[1]} showExtra />)
    await flushLoad()
    expect(wrapper.find('.easy-user-picker__extra').text()).toBe('技术部')
  })

  it('disabled 时渲染占位符', () => {
    const wrapper = mount(() => <UserPicker disabled placeholder="无权限" />)
    expect(wrapper.find('.easy-user-picker__placeholder').text()).toBe('无权限')
  })

  it('disabled 时不渲染添加按钮', () => {
    const wrapper = mount(() => <UserPicker disabled />)
    expect(wrapper.find('.easy-user-picker__add').exists()).toBe(false)
  })

  it('disabled 时不渲染关闭按钮', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <UserPicker modelValue={[1]} disabled />)
    await flushLoad()
    expect(wrapper.find('.easy-user-picker__close').exists()).toBe(false)
  })

  it('点击添加按钮后组件保持正常渲染', async () => {
    vi.useFakeTimers()
    const wrapper = mount(() => <UserPicker />)
    await wrapper.find('.easy-user-picker__add').trigger('click')
    await flushLoad()
    expect(wrapper.find('.easy-user-picker').exists()).toBe(true)
    wrapper.unmount()
  })

  it('点击已选用户关闭按钮触发 update:modelValue 移除', async () => {
    vi.useFakeTimers()
    const onUpdate = vi.fn()
    const wrapper = mount(() => <UserPicker modelValue={[1]} onUpdate:modelValue={onUpdate} />)
    await flushLoad()
    await wrapper.find('.easy-user-picker__close').trigger('click')
    expect(onUpdate).toHaveBeenCalled()
  })
})
