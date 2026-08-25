<script setup lang="ts">
import { emptyProps } from './empty'

import { useEmpty } from './use-empty'

defineOptions({ name: 'EasyEmpty' })

const props = defineProps(emptyProps)

const { wrapStyle, imageStyle, descriptionText, currentSvg } = useEmpty(props)
</script>

<template>
  <div class="easy-empty" :class="[`easy-empty--${size}`]" :style="wrapStyle">
    <!-- 图片区域 -->
    <div class="easy-empty__image" :style="imageStyle">
      <slot name="image">
        <!-- 自定义图片 -->
        <img v-if="image" :src="image" :alt="description || '暂无数据'" class="easy-empty__img">
        <!-- 内置 SVG 插图 -->
        <component :is="currentSvg" v-else class="easy-empty__svg" />
      </slot>
    </div>

    <!-- 描述文字 -->
    <div class="easy-empty__description">
      <slot name="description">
        <span>{{ descriptionText }}</span>
      </slot>
    </div>

    <!-- 底部操作区 -->
    <div v-if="$slots.default" class="easy-empty__footer">
      <slot />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 empty-style.scss） -->
<style scoped src="./empty-style.scss" lang="scss"></style>
