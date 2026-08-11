import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Avatar from '../src/avatar.vue'

describe('Avatar 头像组件', () => {
  test('渲染基础头像与默认类名', () => {
    const wrapper = mount(() => <Avatar />)
    expect(wrapper.find('.easy-avatar').exists()).toBe(true)
    expect(wrapper.classes()).toContain('easy-avatar--default')
    expect(wrapper.classes()).toContain('easy-avatar--circle')
  })

  test('有 src 时渲染图片', () => {
    const wrapper = mount(() => <Avatar src="/logo.png" alt="logo" />)
    const img = wrapper.find('.easy-avatar__image')
    expect(img.exists()).toBe(true)
    expect((img.element as HTMLImageElement).src).toContain('/logo.png')
    expect((img.element as HTMLImageElement).alt).toBe('logo')
  })

  test('无 src 时渲染默认图标', () => {
    const wrapper = mount(() => <Avatar />)
    expect(wrapper.find('.easy-avatar__icon').exists()).toBe(true)
    expect(wrapper.find('.easy-avatar__icon svg').exists()).toBe(true)
  })

  test('size 为数字时应用像素尺寸', () => {
    const wrapper = mount(() => <Avatar size={60} />)
    const el = wrapper.find('.easy-avatar').element as HTMLElement
    expect(el.style.width).toBe('60px')
    expect(el.style.height).toBe('60px')
  })

  test('size 为枚举时应用类名', () => {
    const wrapper = mount(() => <Avatar size="large" />)
    expect(wrapper.classes()).toContain('easy-avatar--large')
  })

  test('shape 应用到类名', () => {
    const wrapper = mount(() => <Avatar shape="square" />)
    expect(wrapper.classes()).toContain('easy-avatar--square')
  })

  test('color 应用到背景色', () => {
    const wrapper = mount(() => <Avatar color="#ff0000" />)
    const el = wrapper.find('.easy-avatar').element as HTMLElement
    expect(el.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  test('fit 应用到 object-fit', () => {
    const wrapper = mount(() => <Avatar src="/logo.png" fit="contain" />)
    const el = wrapper.find('.easy-avatar').element as HTMLElement
    expect(el.style.objectFit).toBe('contain')
  })

  test('图片加载失败触发 error 并回退到图标', async () => {
    const onError = vi.fn()
    const wrapper = mount(() => <Avatar src="/bad.png" onError={onError} />)
    const img = wrapper.find('.easy-avatar__image')
    await img.trigger('error')
    await nextTick()
    expect(onError).toHaveBeenCalled()
    expect(wrapper.find('.easy-avatar__image').exists()).toBe(false)
    expect(wrapper.find('.easy-avatar__icon').exists()).toBe(true)
  })

  test('点击头像触发 click 事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <Avatar onClick={onClick} />)
    await wrapper.find('.easy-avatar').trigger('click')
    expect(onClick).toHaveBeenCalled()
  })

  test('customClass 合并到类名', () => {
    const wrapper = mount(() => <Avatar customClass="my-avatar" />)
    expect(wrapper.classes()).toContain('my-avatar')
  })
})
