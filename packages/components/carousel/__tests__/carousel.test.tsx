import { mount } from '@vue/test-utils'
import Carousel from '../src/carousel.vue'

const items = ['/img1.png', '/img2.png', '/img3.png']

describe('Carousel 轮播组件', () => {
  it('渲染基础轮播容器', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} />)
    expect(wrapper.find('.easy-carousel').exists()).toBe(true)
    expect(wrapper.find('.easy-carousel__container').exists()).toBe(true)
  })

  it('渲染每张轮播图片', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} />)
    const imgs = wrapper.findAll('.easy-carousel__img')
    expect(imgs.length).toBe(3)
    expect((imgs[0].element as HTMLImageElement).src).toContain('/img1.png')
  })

  it('第一个 item 默认激活', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} />)
    const itemsEl = wrapper.findAll('.easy-carousel__item')
    expect(itemsEl[0].classes()).toContain('is-active')
  })

  it('渲染指示器圆点', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} />)
    expect(wrapper.findAll('.easy-carousel__dot').length).toBe(3)
  })

  it('showDots=false 不渲染指示器', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} showDots={false} />)
    expect(wrapper.find('.easy-carousel__dots').exists()).toBe(false)
  })

  it('渲染左右箭头', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} />)
    expect(wrapper.find('.easy-carousel__arrow--left').exists()).toBe(true)
    expect(wrapper.find('.easy-carousel__arrow--right').exists()).toBe(true)
  })

  it('showArrows=false 不渲染箭头', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} showArrows={false} />)
    expect(wrapper.find('.easy-carousel__arrow').exists()).toBe(false)
  })

  it('点击右箭头切换到下一张', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <Carousel items={items} interval={0} onChange={onChange} />)
    await wrapper.find('.easy-carousel__arrow--right').trigger('click')
    const activeItems = wrapper.findAll('.easy-carousel__item').filter(i => i.classes().includes('is-active'))
    expect(activeItems.length).toBe(1)
    // 切换到第二张
    expect(wrapper.findAll('.easy-carousel__item')[1].classes()).toContain('is-active')
    expect(onChange).toHaveBeenCalledWith(1, 0)
  })

  it('点击左箭头切换到上一张（循环）', async () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} loop />)
    await wrapper.find('.easy-carousel__arrow--left').trigger('click')
    // 循环到最后一张
    expect(wrapper.findAll('.easy-carousel__item')[2].classes()).toContain('is-active')
  })

  it('direction=vertical 应用到类名', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} direction="vertical" />)
    expect(wrapper.find('.easy-carousel').classes()).toContain('easy-carousel--vertical')
  })

  it('mode=3d 应用到类名并渲染 3D 项', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} mode="3d" />)
    expect(wrapper.find('.easy-carousel').classes()).toContain('easy-carousel--3d')
    expect(wrapper.findAll('.easy-carousel__3d-item').length).toBe(3)
  })

  it('dotType=number 渲染数字指示器', () => {
    const wrapper = mount(() => <Carousel items={items} interval={0} dotType="number" />)
    expect(wrapper.find('.easy-carousel__number').exists()).toBe(true)
    expect(wrapper.find('.easy-carousel__number-total').text()).toBe('3')
  })

  it('showTitle 渲染对象数组标题', () => {
    const objItems = [{ src: '/a.png', title: '第一张' }, { src: '/b.png', title: '第二张' }]
    const wrapper = mount(() => <Carousel items={objItems as any} interval={0} showTitle />)
    expect(wrapper.find('.easy-carousel__title-text').text()).toBe('第一张')
  })

  it('expose next/prev/goTo 方法', () => {
    const wrapper = mount(Carousel, { props: { items, interval: 0 } })
    const vm = wrapper.vm as unknown as { next: () => void, prev: () => void, goTo: (i: number) => void }
    expect(typeof vm.next).toBe('function')
    expect(typeof vm.prev).toBe('function')
    expect(typeof vm.goTo).toBe('function')
  })
})
