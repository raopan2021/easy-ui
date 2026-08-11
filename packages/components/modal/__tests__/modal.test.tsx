import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Modal from '../src/modal.vue'

describe('Modal 弹窗组件', () => {
  it('modelValue 为 false 时不渲染', () => {
    const wrapper = mount(() => <Modal modelValue={false} title="标题" />)
    expect(document.body.querySelector('.easy-modal-mask')).toBeNull()
    wrapper.unmount()
  })

  it('modelValue 为 true 时渲染弹窗', async () => {
    const wrapper = mount(() => <Modal modelValue title="弹窗标题" />)
    await nextTick()
    await nextTick()
    const mask = document.body.querySelector('.easy-modal-mask')
    expect(mask).toBeTruthy()
    expect(mask!.querySelector('.easy-modal__title')!.textContent).toBe('弹窗标题')
    wrapper.unmount()
  })

  it('渲染默认插槽内容', async () => {
    const wrapper = mount(() => (
      <Modal modelValue>{{ default: () => <p class="modal-content">内容</p> }}</Modal>
    ))
    await nextTick()
    await nextTick()
    const body = document.body.querySelector('.easy-modal__body')
    expect(body!.querySelector('.modal-content')!.textContent).toBe('内容')
    wrapper.unmount()
  })

  it('size 应用到类名与宽度', async () => {
    const wrapper = mount(() => <Modal modelValue size="large" />)
    await nextTick()
    await nextTick()
    const modal = document.body.querySelector('.easy-modal') as HTMLElement
    expect(modal.classList.contains('easy-modal--large')).toBe(true)
    expect(modal.style.width).toBe('780px')
    wrapper.unmount()
  })

  it('width 优先于 size', async () => {
    const wrapper = mount(() => <Modal modelValue size="small" width="300px" />)
    await nextTick()
    await nextTick()
    const modal = document.body.querySelector('.easy-modal') as HTMLElement
    expect(modal.style.width).toBe('300px')
    wrapper.unmount()
  })

  it('点击遮罩触发 update:modelValue false', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Modal modelValue onUpdate:modelValue={onUpdate} />)
    await nextTick()
    await nextTick()
    const mask = document.body.querySelector('.easy-modal-mask') as HTMLElement
    mask.click()
    await nextTick()
    expect(onUpdate).toHaveBeenCalledWith(false)
    wrapper.unmount()
  })

  it('closeOnClickModal=false 点击遮罩不关闭', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => (
      <Modal modelValue closeOnClickModal={false} onUpdate:modelValue={onUpdate} />
    ))
    await nextTick()
    await nextTick()
    const mask = document.body.querySelector('.easy-modal-mask') as HTMLElement
    mask.click()
    await nextTick()
    expect(onUpdate).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('点击确认按钮触发 confirm 事件', async () => {
    const onConfirm = vi.fn()
    const wrapper = mount(() => <Modal modelValue onConfirm={onConfirm} />)
    await nextTick()
    await nextTick()
    const confirmBtn = document.body.querySelector('.easy-modal__footer-actions .easy-button--primary') as HTMLElement
    expect(confirmBtn).toBeTruthy()
    confirmBtn.click()
    await nextTick()
    expect(onConfirm).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('confirmText 应用到确认按钮文本', async () => {
    const wrapper = mount(() => <Modal modelValue confirmText="保存" />)
    await nextTick()
    await nextTick()
    const footer = document.body.querySelector('.easy-modal__footer')!
    expect(footer.textContent).toContain('保存')
    wrapper.unmount()
  })

  it('showConfirm=false 不渲染确认按钮', async () => {
    const wrapper = mount(() => <Modal modelValue showConfirm={false} />)
    await nextTick()
    await nextTick()
    const footer = document.body.querySelector('.easy-modal__footer')!
    expect(footer.querySelector('.easy-button--primary')).toBeNull()
    wrapper.unmount()
  })

  it('showMask=false 添加透明遮罩类名', async () => {
    const wrapper = mount(() => <Modal modelValue showMask={false} />)
    await nextTick()
    await nextTick()
    expect(document.body.querySelector('.easy-modal-mask')!.classList.contains('easy-modal-mask--transparent')).toBe(true)
    wrapper.unmount()
  })

  it('placement=top-left 应用遮罩对齐样式', async () => {
    const wrapper = mount(() => <Modal modelValue placement="top-left" />)
    await nextTick()
    await nextTick()
    const mask = document.body.querySelector('.easy-modal-mask') as HTMLElement
    expect(mask.style.justifyContent).toBe('flex-start')
    expect(mask.style.alignItems).toBe('flex-start')
    wrapper.unmount()
  })
})
