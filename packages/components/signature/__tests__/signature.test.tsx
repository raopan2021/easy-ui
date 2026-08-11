import { mount } from '@vue/test-utils'
import Signature from '../src/signature.vue'

describe('Signature.vue', () => {
  test('renders base structure', () => {
    const wrapper = mount(() => <Signature />)
    expect(wrapper.find('.easy-signature').exists()).toBe(true)
    expect(wrapper.find('.easy-signature__toolbar').exists()).toBe(true)
    expect(wrapper.find('.easy-signature__canvas').exists()).toBe(true)
  })

  test('renders placeholder text', () => {
    const wrapper = mount(() => <Signature placeholder="请签名" />)
    expect(wrapper.find('.easy-signature__placeholder-text').text()).toBe('请签名')
  })

  test('default placeholder text', () => {
    const wrapper = mount(() => <Signature />)
    expect(wrapper.find('.easy-signature__placeholder-text').text()).toBe('请在此处手写签名')
  })

  test('hide placeholder via showPlaceholder=false', () => {
    const wrapper = mount(() => <Signature showPlaceholder={false} />)
    expect(wrapper.find('.easy-signature__placeholder').exists()).toBe(false)
  })

  test('hide toolbar via showToolbar=false', () => {
    const wrapper = mount(() => <Signature showToolbar={false} />)
    expect(wrapper.find('.easy-signature__toolbar').exists()).toBe(false)
    expect(wrapper.find('.easy-signature').classes()).toContain('is-toolbar-hidden')
  })

  test('pen size options rendered by default', () => {
    const wrapper = mount(() => <Signature />)
    const penBtns = wrapper.findAll('.easy-signature__pen-btn')
    expect(penBtns.length).toBe(4)
  })

  test('hide pen size via showPenSize=false', () => {
    const wrapper = mount(() => <Signature showPenSize={false} />)
    expect(wrapper.find('.easy-signature__pen-size').exists()).toBe(false)
  })

  test('pen color options only when showPenColor=true', () => {
    const wrapper = mount(() => <Signature showPenColor />)
    expect(wrapper.findAll('.easy-signature__color-btn').length).toBe(7)
    const wrapper2 = mount(() => <Signature showPenColor={false} />)
    expect(wrapper2.find('.easy-signature__pen-color').exists()).toBe(false)
  })

  test('disabled adds is-disabled class', () => {
    const wrapper = mount(() => <Signature disabled />)
    expect(wrapper.find('.easy-signature').classes()).toContain('is-disabled')
  })

  test('custom width/height applied to canvas wrap', () => {
    const wrapper = mount(() => <Signature width={400} height={300} />)
    const wrapStyle = (wrapper.find('.easy-signature__canvas-wrap').element as HTMLElement).style
    expect(wrapStyle.width).toBe('400px')
    expect(wrapStyle.height).toBe('300px')
  })

  test('undo/clear buttons disabled when no content', () => {
    const wrapper = mount(() => <Signature />)
    const undoBtn = wrapper.find('.easy-signature__tool-btn[title="撤销"]')
    const clearBtn = wrapper.find('.easy-signature__tool-btn[title="清空"]')
    const confirmBtn = wrapper.find('.easy-signature__tool-btn[title="确认签名"]')
    expect((undoBtn.element as HTMLButtonElement).disabled).toBe(true)
    expect((clearBtn.element as HTMLButtonElement).disabled).toBe(true)
    expect((confirmBtn.element as HTMLButtonElement).disabled).toBe(true)
  })

  test('exposes undo/clear/confirm/getDataUrl methods', () => {
    const wrapper = mount(Signature)
    const vm = wrapper.vm as unknown as {
      undo: () => void
      clear: () => void
      confirm: () => void
      getDataUrl: () => string
      setPenColor: (c: string) => void
      setPenSize: (n: number) => void
    }
    expect(typeof vm.undo).toBe('function')
    expect(typeof vm.clear).toBe('function')
    expect(typeof vm.confirm).toBe('function')
    expect(typeof vm.getDataUrl).toBe('function')
    expect(typeof vm.setPenColor).toBe('function')
    expect(typeof vm.setPenSize).toBe('function')
  })
})
