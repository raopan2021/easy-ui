import { mount } from '@vue/test-utils'
import Button from '../src/button.vue'

describe('Button 按钮组件', () => {
  it('渲染基础按钮与默认类名', () => {
    const wrapper = mount(() => <Button>按钮</Button>)
    expect(wrapper.find('.easy-button').exists()).toBe(true)
    expect(wrapper.find('.easy-button').text()).toBe('按钮')
    expect(wrapper.classes()).toContain('easy-button--default')
  })

  it('type 应用到类名', () => {
    const wrapper = mount(() => <Button type="primary">主按钮</Button>)
    expect(wrapper.classes()).toContain('easy-button--primary')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <Button size="small">小</Button>)
    expect(wrapper.classes()).toContain('easy-button--small')
  })

  it('shape 应用到类名', () => {
    const wrapper = mount(() => <Button shape="circle">圆</Button>)
    expect(wrapper.classes()).toContain('easy-button--circle')
  })

  it('htmlType 应用到原生按钮属性', () => {
    const wrapper = mount(() => <Button htmlType="submit">提交</Button>)
    expect((wrapper.find('button').element as HTMLButtonElement).type).toBe('submit')
  })

  it('disabled 禁用按钮并阻止点击', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <Button disabled onClick={onClick}>禁用</Button>)
    expect(wrapper.find('button').element.disabled).toBe(true)
    expect(wrapper.classes()).toContain('is-disabled')
    await wrapper.find('button').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('loading 显示加载状态并禁用点击', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <Button loading onClick={onClick}>加载</Button>)
    expect(wrapper.classes()).toContain('is-loading')
    await wrapper.find('button').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('bold 添加加粗类名', () => {
    const wrapper = mount(() => <Button bold>加粗</Button>)
    expect(wrapper.classes()).toContain('is-bold')
  })

  it('link 添加链接类名', () => {
    const wrapper = mount(() => <Button link type="primary">链接</Button>)
    expect(wrapper.classes()).toContain('is-link')
  })

  it('点击按钮触发 click 事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <Button onClick={onClick}>点击</Button>)
    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('自定义类名与 style 生效', () => {
    const wrapper = mount(() => <Button class="my-btn" style="width: 100px;">自定义</Button>)
    expect(wrapper.classes()).toContain('my-btn')
    expect((wrapper.element as HTMLElement).style.width).toBe('100px')
  })
})
