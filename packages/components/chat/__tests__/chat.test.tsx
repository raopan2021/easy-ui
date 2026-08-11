import type { ChatMessage } from '../src/chat-message.vue'
import { mount } from '@vue/test-utils'
import Chat from '../src/chat.vue'

const messages: ChatMessage[] = [
  { id: '1', role: 'user', content: '你好' },
  { id: '2', role: 'assistant', content: '您好！' },
]

describe('Chat 聊天组件', () => {
  it('渲染聊天容器', () => {
    const wrapper = mount(() => <Chat messages={messages} />)
    expect(wrapper.find('.easy-chat').exists()).toBe(true)
  })

  it('渲染消息列表', () => {
    const wrapper = mount(() => <Chat messages={messages} />)
    expect(wrapper.findAll('.easy-chat-message').length).toBe(2)
  })

  it('渲染消息内容文本', () => {
    const wrapper = mount(() => <Chat messages={messages} />)
    expect(wrapper.find('.easy-chat-message__text').text()).toBe('你好')
  })

  it('空消息列表渲染空状态', () => {
    const wrapper = mount(() => <Chat messages={[]} />)
    expect(wrapper.find('.easy-chat__empty').exists()).toBe(true)
  })

  it('disabled 应用禁用类名', () => {
    const wrapper = mount(() => <Chat messages={[]} disabled />)
    expect(wrapper.find('.easy-chat').classes()).toContain('is-disabled')
  })

  it('disabled 时不渲染输入区域', () => {
    const wrapper = mount(() => <Chat messages={[]} disabled />)
    expect(wrapper.find('.easy-chat__input-wrapper').exists()).toBe(false)
  })

  it('非 disabled 渲染输入区域', () => {
    const wrapper = mount(() => <Chat messages={[]} />)
    expect(wrapper.find('.easy-chat__input-wrapper').exists()).toBe(true)
  })

  it('loading 渲染加载状态', () => {
    const wrapper = mount(() => <Chat messages={[]} loading />)
    expect(wrapper.find('.easy-chat__loading').exists()).toBe(true)
  })

  it('发送消息触发 send 事件', async () => {
    const onSend = vi.fn()
    const wrapper = mount(() => <Chat messages={[]} onSend={onSend} />)
    const textarea = wrapper.find('.easy-chat-input__textarea')
    await textarea.setValue('新消息')
    await wrapper.find('.easy-chat-input__send-btn').trigger('click')
    expect(onSend).toHaveBeenCalled()
    expect(onSend.mock.calls[0]![0]).toContain('新消息')
  })

  it('placeholder 应用到输入框', () => {
    const wrapper = mount(() => <Chat messages={[]} placeholder="请输入消息" />)
    expect((wrapper.find('.easy-chat-input__textarea').element as HTMLTextAreaElement).placeholder).toBe('请输入消息')
  })
})
