import { mount } from '@vue/test-utils'
import Empty from '../src/empty.vue'

describe('Empty 空状态组件', () => {
  test('默认渲染空状态', () => {
    const wrapper = mount(() => <Empty />)
    expect(wrapper.find('.easy-empty').exists()).toBe(true)
    expect(wrapper.find('.easy-empty__description').text()).toBe('暂无数据')
  })

  test('type 映射默认描述文案', () => {
    const cases: Array<[string, string]> = [
      ['search', '没有找到相关内容'],
      ['network', '网络连接异常'],
      ['permission', '暂无权限访问'],
      ['list', '列表为空'],
    ]
    for (const [type, text] of cases) {
      const wrapper = mount(() => <Empty type={type as any} />)
      expect(wrapper.find('.easy-empty__description').text()).toBe(text)
    }
  })

  test('description 属性覆盖默认文案', () => {
    const wrapper = mount(() => <Empty description="自定义文案" />)
    expect(wrapper.find('.easy-empty__description').text()).toBe('自定义文案')
  })

  test('description 插槽覆盖默认文案', () => {
    const wrapper = mount(() => (
      <Empty>{{ description: () => '插槽文案' }}</Empty>
    ))
    expect(wrapper.find('.easy-empty__description').text()).toBe('插槽文案')
  })

  test('image 属性渲染自定义图片', () => {
    const wrapper = mount(() => <Empty image="/logo.png" />)
    const img = wrapper.find('.easy-empty__img')
    expect(img.exists()).toBe(true)
    expect((img.element as HTMLImageElement).src).toContain('/logo.png')
  })

  test('未设置 image 时渲染内置 SVG', () => {
    const wrapper = mount(() => <Empty />)
    expect(wrapper.find('.easy-empty__svg').exists()).toBe(true)
  })

  test('imageSize 应用到图片区域宽度', () => {
    const wrapper = mount(() => <Empty imageSize={200} />)
    const image = wrapper.find('.easy-empty__image')
    expect((image.element as HTMLElement).style.width).toBe('200px')
  })

  test('size 应用到根类名', () => {
    const wrapper = mount(() => <Empty size="large" />)
    expect(wrapper.find('.easy-empty').classes()).toContain('easy-empty--large')
  })

  test('默认插槽渲染为底部操作区', () => {
    const wrapper = mount(() => (
      <Empty>{{ default: () => <button>重试</button> }}</Empty>
    ))
    expect(wrapper.find('.easy-empty__footer').exists()).toBe(true)
    expect(wrapper.find('.easy-empty__footer button').text()).toBe('重试')
  })

  test('无默认插槽时不渲染底部操作区', () => {
    const wrapper = mount(() => <Empty />)
    expect(wrapper.find('.easy-empty__footer').exists()).toBe(false)
  })
})
