import { mount } from '@vue/test-utils'
import Video from '../src/video.vue'

describe('Video 视频组件', () => {
  it('渲染视频容器', () => {
    const wrapper = mount(() => <Video src="/video.mp4" />)
    expect(wrapper.find('.easy-video-wrapper').exists()).toBe(true)
    expect(wrapper.find('.easy-video').exists()).toBe(true)
  })

  it('渲染 video 元素并设置 src', () => {
    const wrapper = mount(() => <Video src="/video.mp4" />)
    const video = wrapper.find('video')
    expect(video.exists()).toBe(true)
    expect((video.element as HTMLVideoElement).src).toContain('/video.mp4')
  })

  it('poster 应用到 video 封面', () => {
    const wrapper = mount(() => <Video src="/video.mp4" poster="/cover.png" />)
    expect((wrapper.find('video').element as HTMLVideoElement).poster).toContain('/cover.png')
  })

  it('showPoster 渲染播放按钮', () => {
    const wrapper = mount(() => <Video src="/video.mp4" showPoster />)
    expect(wrapper.find('.easy-video__play-btn').exists()).toBe(true)
  })

  it('controls 渲染控制栏', () => {
    const wrapper = mount(() => <Video src="/video.mp4" controls />)
    expect(wrapper.find('.easy-video__controls').exists()).toBe(true)
  })

  it('controls 通过 v-show 渲染（未播放时显示）', () => {
    const wrapper = mount(() => <Video src="/video.mp4" controls={false} />)
    // 控制栏使用 v-show，条件含 !isPlaying（初始 true），因此始终在 DOM 中
    expect(wrapper.find('.easy-video__controls').exists()).toBe(true)
  })

  it('渲染播放按钮', () => {
    const wrapper = mount(() => <Video src="/video.mp4" controls />)
    expect(wrapper.find('.easy-video__btn-play').exists()).toBe(true)
  })

  it('渲染时间区域', () => {
    const wrapper = mount(() => <Video src="/video.mp4" controls />)
    expect(wrapper.find('.easy-video__time').exists()).toBe(true)
  })

  it('width 应用到播放器容器样式', () => {
    const wrapper = mount(() => <Video src="/video.mp4" width={640} />)
    const el = wrapper.find('.easy-video').element as HTMLElement
    expect(el.style.width).toBe('640px')
  })

  it('viewCount 设置不影响渲染', () => {
    const wrapper = mount(() => <Video src="/video.mp4" viewCount={1234} controls />)
    expect(wrapper.find('.easy-video').exists()).toBe(true)
  })
})
