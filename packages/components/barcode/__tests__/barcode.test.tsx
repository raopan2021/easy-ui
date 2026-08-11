import { flushPromises, mount } from '@vue/test-utils'
import { vi } from 'vitest'

// mock jsbarcode 库：避免真实 SVG 绘制依赖 jsdom 不支持的 API
vi.mock('jsbarcode', () => ({
  default: vi.fn(() => {}),
}))

import JsBarcode from 'jsbarcode'
import Barcode from '../src/barcode.vue'

const jsbarcodeMock = JsBarcode as unknown as ReturnType<typeof vi.fn>

describe('Barcode.vue', () => {
  beforeEach(() => {
    jsbarcodeMock.mockClear()
  })

  test('renders placeholder when content is empty', () => {
    const wrapper = mount(() => <Barcode content="" />)
    expect(wrapper.find('.easy-barcode').exists()).toBe(true)
    expect(wrapper.find('.easy-barcode__placeholder').exists()).toBe(true)
    expect(wrapper.find('.easy-barcode__placeholder').text()).toBe('请输入内容')
    expect(jsbarcodeMock).not.toHaveBeenCalled()
  })

  test('renders custom placeholder slot when content empty', () => {
    const wrapper = mount(() => (
      <Barcode content="">
        {{
          placeholder: () => <span class="custom-ph">自定义占位</span>,
        }}
      </Barcode>
    ))
    expect(wrapper.find('.custom-ph').text()).toBe('自定义占位')
  })

  test('calls JsBarcode and emits generated when content provided', async () => {
    const onGenerated = vi.fn()
    const wrapper = mount(() => <Barcode content="12345" onGenerated={onGenerated} />)
    await flushPromises()
    await flushPromises()

    expect(jsbarcodeMock).toHaveBeenCalledTimes(1)
    expect(jsbarcodeMock.mock.calls[0]![1]).toBe('12345')
    expect(onGenerated).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.easy-barcode__svg').exists()).toBe(true)
  })

  test('passes options to JsBarcode', async () => {
    mount(() => <Barcode content="X" format="EAN13" width={3} height={80} />)
    await flushPromises()
    const opts = jsbarcodeMock.mock.calls[0]![2] as Record<string, unknown>
    expect(opts.format).toBe('EAN13')
    expect(opts.width).toBe(3)
    expect(opts.height).toBe(80)
  })

  test('exposes getSvgElement / toSVGString / downloadSVG / downloadPNG methods', async () => {
    const wrapper = mount(Barcode, { props: { content: 'x' } })
    await flushPromises()
    const vm = wrapper.vm as unknown as {
      getSvgElement: () => SVGElement | null
      toSVGString: () => string
      downloadSVG: () => void
      downloadPNG: () => void
    }
    expect(typeof vm.getSvgElement).toBe('function')
    expect(typeof vm.toSVGString).toBe('function')
    expect(typeof vm.downloadSVG).toBe('function')
    expect(typeof vm.downloadPNG).toBe('function')
  })

  test('emits error when JsBarcode throws', async () => {
    jsbarcodeMock.mockImplementationOnce(() => {
      throw new Error('barcode draw failed')
    })
    const onError = vi.fn()
    mount(() => <Barcode content="bad" onError={onError} />)
    await flushPromises()
    await flushPromises()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0].message).toBe('barcode draw failed')
  })
})
