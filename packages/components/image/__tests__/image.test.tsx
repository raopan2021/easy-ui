import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Image from '../src/image.vue'

describe('Image 图片组件', () => {
  it('渲染图片元素', () => {
    const wrapper = mount(() => <Image src="/logo.png" alt="logo" />)
    const img = wrapper.find('.easy-image__img')
    expect(img.exists()).toBe(true)
    expect((img.element as HTMLImageElement).src).toContain('/logo.png')
    expect((img.element as HTMLImageElement).alt).toBe('logo')
  })

  it('单图时渲染单图容器', () => {
    const wrapper = mount(() => <Image src="/logo.png" />)
    expect(wrapper.find('.easy-image').classes()).toContain('easy-image--single')
    expect(wrapper.find('.easy-image__single').exists()).toBe(true)
  })

  it('多图时渲染网格模式', () => {
    const wrapper = mount(() => <Image src={['/a.png', '/b.png', '/c.png']} />)
    expect(wrapper.find('.easy-image').classes()).toContain('easy-image--grid')
    expect(wrapper.find('.easy-image__list').exists()).toBe(true)
    expect(wrapper.findAll('.easy-image__item').length).toBe(3)
  })

  it('max 截断显示的图片数量', () => {
    const wrapper = mount(() => <Image src={['/a.png', '/b.png', '/c.png']} max={2} />)
    expect(wrapper.findAll('.easy-image__item').length).toBe(2)
  })

  it('超出 max 时显示数量遮罩', () => {
    const wrapper = mount(() => <Image src={['/a.png', '/b.png', '/c.png']} max={2} />)
    const mask = wrapper.find('.easy-image__mask')
    expect(mask.exists()).toBe(true)
    expect(mask.text()).toBe('+1')
  })

  it('图片加载失败触发 error 事件', async () => {
    const onError = vi.fn()
    const wrapper = mount(() => <Image src="/bad.png" onError={onError} />)
    await wrapper.find('.easy-image__img').trigger('error')
    await nextTick()
    expect(onError).toHaveBeenCalled()
  })

  it('width 与 height 应用到单图样式', () => {
    const wrapper = mount(() => <Image src="/logo.png" width={80} height={60} />)
    const el = wrapper.find('.easy-image__single').element as HTMLElement
    expect(el.style.width).toBe('80px')
    expect(el.style.height).toBe('60px')
  })

  it('fit 应用到 object-fit', () => {
    const wrapper = mount(() => <Image src="/logo.png" fit="cover" />)
    const el = wrapper.find('.easy-image__img').element as HTMLElement
    expect(el.style.objectFit).toBe('cover')
  })

  it('点击单图触发 preview 事件并打开预览', async () => {
    const onPreview = vi.fn()
    const wrapper = mount(() => <Image src="/logo.png" onPreview={onPreview} />)
    await wrapper.find('.easy-image__single').trigger('click')
    await nextTick()
    expect(onPreview).toHaveBeenCalledWith(0)
    expect(document.body.querySelector('.easy-image-preview')).toBeTruthy()
    wrapper.unmount()
  })

  it('preview=false 点击不打开预览', async () => {
    const onPreview = vi.fn()
    const wrapper = mount(() => <Image src="/logo.png" preview={false} onPreview={onPreview} />)
    await wrapper.find('.easy-image__single').trigger('click')
    await nextTick()
    expect(onPreview).not.toHaveBeenCalled()
    expect(document.body.querySelector('.easy-image-preview')).toBeFalsy()
  })

  it('previewSrcList 优先于 src 展示', () => {
    const wrapper = mount(() => <Image src="/a.png" previewSrcList={['/x.png', '/y.png']} />)
    expect(wrapper.find('.easy-image').classes()).toContain('easy-image--grid')
    expect(wrapper.findAll('.easy-image__item').length).toBe(2)
  })

  it('overlay 插槽渲染遮罩内容', () => {
    const wrapper = mount(() => (
      <Image src="/logo.png">
        {{
          overlay: () => <span class="overlay-text">遮罩</span>,
        }}
      </Image>
    ))
    expect(wrapper.find('.easy-image__overlay .overlay-text').text()).toBe('遮罩')
  })
})
