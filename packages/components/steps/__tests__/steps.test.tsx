import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Step from '../src/step.vue'
import Steps from '../src/steps.vue'

function renderSteps(props: Record<string, any> = {}, stepTitles: string[] = ['步骤一', '步骤二', '步骤三']) {
  return mount(() => (
    <Steps {...props}>
      {stepTitles.map((t, i) => <Step key={i} index={i} title={t} />)}
    </Steps>
  ))
}

describe('Steps 步骤条组件', () => {
  it('渲染基础步骤条与子步骤', async () => {
    const wrapper = renderSteps()
    await nextTick()
    expect(wrapper.find('.easy-steps').exists()).toBe(true)
    expect(wrapper.findAll('.easy-step').length).toBe(3)
  })

  it('direction 应用到类名', () => {
    const wrapper = renderSteps({ direction: 'vertical' })
    expect(wrapper.find('.easy-steps').classes()).toContain('easy-steps--vertical')
  })

  it('渲染步骤标题', async () => {
    const wrapper = renderSteps()
    await nextTick()
    const titles = wrapper.findAll('.easy-step__title')
    expect(titles[0].text()).toBe('步骤一')
  })

  it('active 使对应步骤为 process 状态', async () => {
    const wrapper = renderSteps({ active: 1 })
    await nextTick()
    const steps = wrapper.findAll('.easy-step')
    expect(steps[1].classes()).toContain('easy-step--process')
  })

  it('active 之前的步骤为 success 状态（默认 finishStatus）', async () => {
    const wrapper = renderSteps({ active: 1 })
    await nextTick()
    const steps = wrapper.findAll('.easy-step')
    expect(steps[0].classes()).toContain('easy-step--success')
  })

  it('active 之后的步骤为 wait 状态', async () => {
    const wrapper = renderSteps({ active: 1 })
    await nextTick()
    const steps = wrapper.findAll('.easy-step')
    expect(steps[2].classes()).toContain('easy-step--wait')
  })

  it('最后一个步骤添加 is-last 类名', async () => {
    const wrapper = renderSteps()
    await nextTick()
    const steps = wrapper.findAll('.easy-step')
    expect(steps[2].classes()).toContain('is-last')
  })

  it('渲染步骤数字', async () => {
    const wrapper = renderSteps()
    await nextTick()
    expect(wrapper.findAll('.easy-step__number').length).toBe(3)
  })

  it('finish 步骤渲染图标而非数字', async () => {
    const wrapper = renderSteps({ active: 1 })
    await nextTick()
    const steps = wrapper.findAll('.easy-step')
    // 第一个（success/finish）不渲染数字，渲染图标区域
    expect(steps[0].find('.easy-step__number').exists()).toBe(false)
    expect(steps[0].find('.easy-step__icon').exists()).toBe(true)
  })

  it('无子步骤时渲染空容器', () => {
    const wrapper = mount(() => <Steps active={0} />)
    expect(wrapper.find('.easy-steps').exists()).toBe(true)
  })
})
