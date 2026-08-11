import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Watermark from '../src/watermark.vue'

// jsdom 不提供 canvas 2d 上下文，mock 以避免组件绘制逻辑抛 unhandled error
function createMockContext() {
  return {
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillText: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    createPattern: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

beforeAll(() => {
  // jsdom 中 canvas.getContext 返回 null，强制覆盖以让绘制逻辑正常执行
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => createMockContext(),
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
    configurable: true,
    value: () => 'data:image/png;base64,mock',
  })
})

describe('Watermark 水印组件', () => {
  test('渲染基础水印容器', () => {
    const wrapper = mount(() => <Watermark content="机密">内容</Watermark>)
    expect(wrapper.find('.easy-watermark').exists()).toBe(true)
    expect(wrapper.find('.easy-watermark__canvas').exists()).toBe(true)
  })

  test('渲染默认插槽内容', () => {
    const wrapper = mount(() => (
      <Watermark content="水印">
        <div class="custom-content">页面内容</div>
      </Watermark>
    ))
    expect(wrapper.find('.custom-content').text()).toBe('页面内容')
  })

  test('fullPage 为 true 时容器为 relative 定位', () => {
    const wrapper = mount(() => <Watermark content="水印" />)
    const el = wrapper.find('.easy-watermark').element as HTMLElement
    expect(el.style.position).toBe('relative')
  })

  test('fullPage 为 false 时不设置 relative 定位', () => {
    const wrapper = mount(() => <Watermark content="水印" fullPage={false} />)
    const el = wrapper.find('.easy-watermark').element as HTMLElement
    expect(el.style.position).toBe('')
  })

  test('zIndex 应用到 canvas 样式', async () => {
    const wrapper = mount(() => <Watermark content="水印" zIndex={999} />)
    await nextTick()
    const canvas = wrapper.find('.easy-watermark__canvas')
    expect((canvas.element as HTMLElement).style.zIndex).toBe('999')
  })

  test('暴露 redraw 方法', () => {
    const wrapper = mount(Watermark, {
      props: { content: '水印' },
    })
    const vm = wrapper.vm as unknown as { redraw: () => Promise<void> }
    expect(typeof vm.redraw).toBe('function')
  })
})
