import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Drawer from '../src/drawer.vue'

describe('Drawer 抽屉组件', () => {
  it('modelValue 为 false 时不渲染', () => {
    const wrapper = mount(() => <Drawer modelValue={false} title="标题" />)
    expect(document.body.querySelector('.easy-drawer-mask')).toBeNull()
    wrapper.unmount()
  })

  it('modelValue 为 true 时渲染抽屉', async () => {
    const wrapper = mount(() => <Drawer modelValue title="抽屉标题" />)
    await nextTick()
    await nextTick()
    const mask = document.body.querySelector('.easy-drawer-mask')
    expect(mask).toBeTruthy()
    expect(mask!.querySelector('.easy-drawer__title')!.textContent).toBe('抽屉标题')
    wrapper.unmount()
  })

  it('渲染默认插槽内容', async () => {
    const wrapper = mount(() => (
      <Drawer modelValue>{{ default: () => <p class="drawer-content">内容</p> }}</Drawer>
    ))
    await nextTick()
    await nextTick()
    const body = document.body.querySelector('.easy-drawer__body')
    expect(body!.querySelector('.drawer-content')!.textContent).toBe('内容')
    wrapper.unmount()
  })

  it('direction 应用到类名', async () => {
    const wrapper = mount(() => <Drawer modelValue direction="left" />)
    await nextTick()
    await nextTick()
    expect(document.body.querySelector('.easy-drawer')!.classList.contains('easy-drawer--left')).toBe(true)
    wrapper.unmount()
  })

  it('默认 direction 为 right', async () => {
    const wrapper = mount(() => <Drawer modelValue />)
    await nextTick()
    await nextTick()
    expect(document.body.querySelector('.easy-drawer')!.classList.contains('easy-drawer--right')).toBe(true)
    wrapper.unmount()
  })

  it('点击遮罩触发 update:modelValue false', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Drawer modelValue onUpdate:modelValue={onUpdate} />)
    await nextTick()
    await nextTick()
    const mask = document.body.querySelector('.easy-drawer-mask') as HTMLElement
    mask.click()
    await nextTick()
    expect(onUpdate).toHaveBeenCalledWith(false)
    wrapper.unmount()
  })

  it('closeOnClickModal=false 点击遮罩不关闭', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => (
      <Drawer modelValue closeOnClickModal={false} onUpdate:modelValue={onUpdate} />
    ))
    await nextTick()
    await nextTick()
    const mask = document.body.querySelector('.easy-drawer-mask') as HTMLElement
    mask.click()
    await nextTick()
    expect(onUpdate).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('size 应用到抽屉宽度', async () => {
    const wrapper = mount(() => <Drawer modelValue size="40%" />)
    await nextTick()
    await nextTick()
    const drawer = document.body.querySelector('.easy-drawer') as HTMLElement
    expect(drawer.style.width).toBe('40%')
    wrapper.unmount()
  })

  it('footer 插槽渲染底部', async () => {
    const wrapper = mount(() => (
      <Drawer modelValue>
        {{
          footer: () => <button class="footer-btn">确定</button>,
        }}
      </Drawer>
    ))
    await nextTick()
    await nextTick()
    const footer = document.body.querySelector('.easy-drawer__footer')
    expect(footer!.querySelector('.footer-btn')!.textContent).toBe('确定')
    wrapper.unmount()
  })

  it('showMask=false 添加透明遮罩类名', async () => {
    const wrapper = mount(() => <Drawer modelValue showMask={false} />)
    await nextTick()
    await nextTick()
    expect(document.body.querySelector('.easy-drawer-mask')!.classList.contains('easy-drawer-mask--transparent')).toBe(true)
    wrapper.unmount()
  })

  it('showClose=false 不渲染关闭按钮', async () => {
    const wrapper = mount(() => <Drawer modelValue showClose={false} />)
    await nextTick()
    await nextTick()
    expect(document.body.querySelector('.easy-drawer__close')).toBeNull()
    wrapper.unmount()
  })
})
