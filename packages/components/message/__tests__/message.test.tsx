import { nextTick } from 'vue'
import { closeMessage, EasyMsg, groupedList, messageList } from '../src/message'

afterEach(() => {
  messageList.length = 0
})

describe('Message 消息提示组件（状态逻辑）', () => {
  it('EasyMsg.success 添加成功类型消息', () => {
    const ins = EasyMsg.success('操作成功')
    expect(messageList.length).toBe(1)
    expect(messageList[0]).toMatchObject({ type: 'success', message: '操作成功' })
    expect(ins.id).toBeDefined()
  })

  it('各类型方法生成对应类型消息', () => {
    EasyMsg.success('成功')
    EasyMsg.warning('警告')
    EasyMsg.danger('危险')
    EasyMsg.info('信息')
    EasyMsg.text('纯文本')
    expect(messageList.map(m => m.type)).toEqual(['success', 'warning', 'danger', 'info', 'text'])
  })

  it('字符串参数转为默认类型 info', () => {
    EasyMsg.info('提示')
    expect(messageList[0].type).toBe('info')
    expect(messageList[0].title).toBe('')
  })

  it('opts 选项设置标题/时长/位置', () => {
    EasyMsg.info('内容', { title: '标题', duration: 100, position: 'bottom-right' })
    const item = messageList[0]
    expect(item.title).toBe('标题')
    expect(item.duration).toBe(100)
    expect(item.position).toBe('bottom-right')
  })

  it('closable 默认开启', () => {
    EasyMsg.info('默认可关闭')
    expect(messageList[0].closable).toBe(true)
  })

  it('closeMessage 按 id 移除消息并触发 onClose', () => {
    const onClose = vi.fn()
    const ins = EasyMsg.info('x', { onClose })
    closeMessage(ins.id)
    expect(messageList.length).toBe(0)
    expect(onClose).toHaveBeenCalled()
  })

  it('closeAll 清空所有消息', () => {
    EasyMsg.success('a')
    EasyMsg.warning('b')
    EasyMsg.info('c')
    EasyMsg.closeAll()
    expect(messageList.length).toBe(0)
  })

  it('groupedList 按 position 分组', async () => {
    EasyMsg.success('顶部')
    EasyMsg.info('左下', { position: 'bottom-left' })
    await nextTick()
    expect(groupedList.value.top.length).toBe(1)
    expect(groupedList.value['bottom-left'].length).toBe(1)
    expect(groupedList.value.top[0].message).toBe('顶部')
  })

  it('duration 到期后自动关闭', () => {
    vi.useFakeTimers()
    EasyMsg.info('短暂', { duration: 50 })
    expect(messageList.length).toBe(1)
    vi.advanceTimersByTime(100)
    expect(messageList.length).toBe(0)
    vi.useRealTimers()
  })

  it('duration 为 0 时不自动关闭', () => {
    vi.useFakeTimers()
    EasyMsg.info('常驻', { duration: 0 })
    vi.advanceTimersByTime(5000)
    expect(messageList.length).toBe(1)
    vi.useRealTimers()
  })
})
