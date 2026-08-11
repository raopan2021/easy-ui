import { flushPromises, mount } from '@vue/test-utils'
import { vi } from 'vitest'

// mock qrcode 库：避免真实 canvas 绘制（jsdom 无 canvas 2D context）
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn((_canvas: HTMLCanvasElement, _content: string) => Promise.resolve()),
  },
}))

import QRCode from 'qrcode'
import Qrcode from '../src/qrcode.vue'

const toCanvasMock = QRCode.toCanvas as ReturnType<typeof vi.fn>

describe('Qrcode.vue', () => {
  beforeEach(() => {
    toCanvasMock.mockClear()
  })

  test('renders placeholder when content is empty', () => {
    const wrapper = mount(() => <Qrcode content="" />)
    expect(wrapper.find('.easy-qrcode').exists()).toBe(true)
    expect(wrapper.find('.easy-qrcode__placeholder').exists()).toBe(true)
    expect(wrapper.find('.easy-qrcode__placeholder').text()).toBe('请输入内容')
    expect(toCanvasMock).not.toHaveBeenCalled()
  })

  test('renders custom placeholder slot when content empty', () => {
    const wrapper = mount(() => (
      <Qrcode content="">
        {{
          placeholder: () => <span class="custom-ph">自定义占位</span>,
        }}
      </Qrcode>
    ))
    expect(wrapper.find('.custom-ph').text()).toBe('自定义占位')
  })

  test('does not draw when content is empty', () => {
    mount(() => <Qrcode content="" />)
    expect(toCanvasMock).not.toHaveBeenCalled()
  })

  test('calls qrcode toCanvas and emits generated when content provided', async () => {
    const onGenerated = vi.fn()
    const wrapper = mount(() => <Qrcode content="hello" onGenerated={onGenerated} />)
    await flushPromises()
    await flushPromises()

    expect(toCanvasMock).toHaveBeenCalledTimes(1)
    expect(toCanvasMock.mock.calls[0]![1]).toBe('hello')
    expect(onGenerated).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.easy-qrcode__canvas').exists()).toBe(true)
  })

  test('exposes toDataURL / toBlob / download methods', async () => {
    const wrapper = mount(Qrcode, { props: { content: 'x' } })
    await flushPromises()
    const vm = wrapper.vm as unknown as {
      toDataURL: () => string
      toBlob: () => Promise<Blob | null>
      download: () => void
    }
    expect(typeof vm.toDataURL).toBe('function')
    expect(typeof vm.toBlob).toBe('function')
    expect(typeof vm.download).toBe('function')
  })

  test('sets canvas dimensions from size prop', async () => {
    const wrapper = mount(() => <Qrcode content="x" size={150} />)
    await flushPromises()
    const canvas = wrapper.find('.easy-qrcode__canvas').element as HTMLCanvasElement
    expect(canvas.width).toBe(150)
    expect(canvas.height).toBe(150)
  })

  test('emits error when qrcode toCanvas rejects', async () => {
    toCanvasMock.mockRejectedValueOnce(new Error('draw failed'))
    const onError = vi.fn()
    mount(() => <Qrcode content="err" onError={onError} />)
    await flushPromises()
    await flushPromises()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0].message).toBe('draw failed')
  })
})
