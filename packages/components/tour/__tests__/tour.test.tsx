import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Tour from '../src/tour.vue'

enableAutoUnmount(afterEach)

afterEach(() => {
  document.body.querySelectorAll('#tour-step-1, #tour-step-2').forEach(el => el.remove())
})

const steps = [
  { target: '#tour-step-1', title: '第一步', description: '这是第一步说明' },
  { target: '#tour-step-2', title: '第二步', description: '这是第二步说明' },
]

function setupTarget() {
  const el = document.createElement('div')
  el.id = 'tour-step-1'
  document.body.appendChild(el)
  const el2 = document.createElement('div')
  el2.id = 'tour-step-2'
  document.body.appendChild(el2)
}

function currentPopover() {
  const all = document.body.querySelectorAll('.easy-tour-popover')
  return all[all.length - 1]
}

async function mountTour(props: Record<string, any> = {}, show = true) {
  // 直接以组件挂载，先设 modelValue=false，再 setProps 为 true 触发 watch
  const wrapper = mount(Tour, { props: { modelValue: false, steps, ...props }, attachTo: document.body })
  if (show) {
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    await nextTick()
  }
  return wrapper
}

describe('Tour 引导组件', () => {
  it('modelValue 为 false 时遮罩不渲染、气泡隐藏', () => {
    setupTarget()
    mount(() => <Tour modelValue={false} steps={steps} />, { attachTo: document.body })
    // 遮罩使用 v-if，modelValue=false 时不渲染
    expect(document.body.querySelector('.easy-tour-overlay')).toBeNull()
    // 气泡使用 v-show，始终在 DOM 中但隐藏
    const popover = currentPopover()
    if (popover)
      expect((popover as HTMLElement).style.display).toBe('none')
  })

  it('modelValue 切换为 true 时渲染引导气泡', async () => {
    setupTarget()
    await mountTour({})
    expect(currentPopover()).toBeTruthy()
    expect((currentPopover() as HTMLElement).style.display).not.toBe('none')
  })

  it('渲染当前步骤标题与描述', async () => {
    setupTarget()
    await mountTour({})
    const popover = currentPopover()!
    expect(popover.querySelector('.easy-tour-title__text')!.textContent).toContain('第一步')
    expect(popover.textContent).toContain('这是第一步说明')
  })

  it('渲染下一步按钮', async () => {
    setupTarget()
    await mountTour({})
    const popover = currentPopover()!
    expect(popover.querySelector('.easy-tour-btn--primary')!.textContent).toContain('下一步')
  })

  it('closeBtn 默认渲染关闭按钮', async () => {
    setupTarget()
    await mountTour({})
    expect(currentPopover()!.querySelector('.easy-tour-close')).toBeTruthy()
  })

  it('closeBtn=false 不渲染关闭按钮', async () => {
    setupTarget()
    await mountTour({ closeBtn: false })
    expect(currentPopover()!.querySelector('.easy-tour-close')).toBeNull()
  })

  it('showIndex 渲染步骤索引', async () => {
    setupTarget()
    await mountTour({ showIndex: true })
    const popover = currentPopover()!
    expect(popover.querySelector('.easy-tour-title__index')!.textContent).toContain('1')
  })

  it('modelValue 切换为 true 时渲染遮罩层', async () => {
    setupTarget()
    await mountTour({})
    expect(document.body.querySelector('.easy-tour-overlay')).toBeTruthy()
  })
})
