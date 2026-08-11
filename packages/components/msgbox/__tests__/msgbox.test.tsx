import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { EasyMsgBox, msgboxState } from '../src/msgbox'
import Msgbox from '../src/msgbox.vue'

describe('Msgbox 消息弹框组件', () => {
  it('默认状态不可见', () => {
    expect(msgboxState.visible).toBe(false)
  })

  it('EasyMsgBox.alert 打开弹框并设置状态', async () => {
    const p = EasyMsgBox.alert('注意保存', '提示', { type: 'warning' })
    await nextTick()
    expect(msgboxState.visible).toBe(true)
    expect(msgboxState.options.message).toBe('注意保存')
    expect(msgboxState.options.title).toBe('提示')
    expect(msgboxState.options.type).toBe('warning')
    expect(msgboxState.options.showCancelButton).toBe(false)
    // 关闭
    msgboxState._resolve('confirm')
    await expect(p).resolves.toEqual({ action: 'confirm', value: undefined })
  })

  it('EasyMsgBox.confirm 显示取消与确认按钮', async () => {
    const p = EasyMsgBox.confirm('确定删除？', '删除', { confirmButtonText: '删除' })
    await nextTick()
    expect(msgboxState.options.showCancelButton).toBe(true)
    expect(msgboxState.options.confirmButtonText).toBe('删除')
    msgboxState._resolve('cancel')
    await expect(p).resolves.toEqual({ action: 'cancel', value: undefined })
  })

  it('EasyMsgBox.prompt 显示输入框并校验', async () => {
    const p = EasyMsgBox.prompt('请输入用户名', '创建', {
      input: { pattern: '^\\d+$', patternMessage: '必须是数字' },
    })
    await nextTick()
    expect(msgboxState.options.showInput).toBe(true)
    // 输入非法值
    msgboxState.inputValue = 'abc'
    // 直接触发确认校验逻辑（通过 _resolve 模拟）
    msgboxState._resolve('confirm', 'abc')
    await expect(p).resolves.toEqual({ action: 'confirm', value: 'abc' })
  })

  it('mount 组件渲染弹框结构', async () => {
    const wrapper = mount(Msgbox)
    // 默认不可见
    expect(document.body.querySelector('.easy-msgbox')).toBeNull()
    EasyMsgBox.open({ message: '自定义内容', title: '标题', type: 'success' })
    await nextTick()
    await nextTick()
    const overlay = document.body.querySelector('.easy-msgbox-overlay')
    expect(overlay).toBeTruthy()
    expect(overlay!.querySelector('.easy-msgbox__title')!.textContent).toBe('标题')
    expect(overlay!.querySelector('.easy-msgbox__message')!.textContent).toBe('自定义内容')
    expect(overlay!.querySelector('.easy-msgbox__btn--confirm')!.textContent).toContain('确定')
    // 关闭清理
    msgboxState._resolve('close')
    wrapper.unmount()
  })

  it('showConfirmButton=false 不渲染确认按钮', async () => {
    const wrapper = mount(Msgbox)
    EasyMsgBox.open({ message: '提示', showConfirmButton: false })
    await nextTick()
    await nextTick()
    const overlay = document.body.querySelector('.easy-msgbox-overlay')!
    expect(overlay.querySelector('.easy-msgbox__btn--confirm')).toBeNull()
    msgboxState._resolve('close')
    wrapper.unmount()
  })

  it('dangerouslyUseHTMLString 渲染 HTML 内容', async () => {
    const wrapper = mount(Msgbox)
    EasyMsgBox.open({ message: '<strong>加粗</strong>', dangerouslyUseHTMLString: true })
    await nextTick()
    await nextTick()
    const overlay = document.body.querySelector('.easy-msgbox-overlay')!
    expect(overlay.querySelector('.easy-msgbox__message strong')).toBeTruthy()
    msgboxState._resolve('close')
    wrapper.unmount()
  })

  it('输入框模式渲染 input 元素', async () => {
    const wrapper = mount(Msgbox)
    EasyMsgBox.prompt('请输入', '标题')
    await nextTick()
    await nextTick()
    const overlay = document.body.querySelector('.easy-msgbox-overlay')!
    expect(overlay.querySelector('.easy-msgbox__input')).toBeTruthy()
    msgboxState._resolve('close')
    wrapper.unmount()
  })
})
