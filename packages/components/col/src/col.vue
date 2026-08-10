<script setup lang="ts">
import type { GutterInjection } from '../../row/src/types'
import { computed, inject, ref } from 'vue'
import { ROW_GUTTER_KEY } from '../../row/src/types'

defineOptions({ name: 'EasyCol' })

const props = withDefaults(defineProps<ColProps>(), {
  span: 24,
  offset: undefined,
  push: undefined,
  pull: undefined,
})

interface ColProps {
  /** 栅格占位格数（0-24） */
  span?: number
  /** 栅格左侧间隔格数 */
  offset?: number
  /** 栅格向右移动格数 */
  push?: number
  /** 栅格向左移动格数 */
  pull?: number
  /** <768px 响应式栅格数或配置 */
  xs?: number | ColBreakpoint
  /** ≥768px 响应式栅格数或配置 */
  sm?: number | ColBreakpoint
  /** ≥992px 响应式栅格数或配置 */
  md?: number | ColBreakpoint
  /** ≥1200px 响应式栅格数或配置 */
  lg?: number | ColBreakpoint
  /** ≥1920px 响应式栅格数或配置 */
  xl?: number | ColBreakpoint
}

interface ColBreakpoint {
  span?: number
  offset?: number
  push?: number
  pull?: number
}

// 从 Row 注入的 gutter
const gutter = inject<GutterInjection>(ROW_GUTTER_KEY, ref({ horizontal: 0, vertical: 0 }))

const colClasses = computed(() => {
  const classes: string[] = [`easy-col--${props.span}`]

  if (props.offset)
    classes.push(`easy-col--offset-${props.offset}`)
  if (props.push)
    classes.push(`easy-col--push-${props.push}`)
  if (props.pull)
    classes.push(`easy-col--pull-${props.pull}`)

  // 响应式
  const breakpoints: (keyof ColProps)[] = ['xs', 'sm', 'md', 'lg', 'xl']
  for (const bp of breakpoints) {
    const val = props[bp]
    if (typeof val === 'number') {
      classes.push(`easy-col--${bp}-${val}`)
    }
    else if (val && typeof val === 'object') {
      if (val.span)
        classes.push(`easy-col--${bp}-${val.span}`)
      if (val.offset)
        classes.push(`easy-col--${bp}-offset-${val.offset}`)
      if (val.push)
        classes.push(`easy-col--${bp}-push-${val.push}`)
      if (val.pull)
        classes.push(`easy-col--${bp}-pull-${val.pull}`)
    }
  }

  return classes
})

const colStyle = computed(() => {
  const style: Record<string, string> = {}
  const horizontalGutter = gutter.value.horizontal
  if (horizontalGutter > 0) {
    style.paddingLeft = `${horizontalGutter / 2}px`
    style.paddingRight = `${horizontalGutter / 2}px`
  }
  return style
})
</script>

<template>
  <div class="easy-col" :class="colClasses" :style="colStyle">
    <slot />
  </div>
</template>

<style scoped lang="scss">
@use 'sass:math';
.easy-col {
  box-sizing: border-box;
  position: relative;
}

/* 栅格宽度生成 */
.easy-col--0 {
  display: none;
}
.easy-col--1 {
  max-width: 4.1667%;
  flex: 0 0 4.1667%;
}
.easy-col--2 {
  max-width: 8.3333%;
  flex: 0 0 8.3333%;
}
.easy-col--3 {
  max-width: 12.5%;
  flex: 0 0 12.5%;
}
.easy-col--4 {
  max-width: 16.6667%;
  flex: 0 0 16.6667%;
}
.easy-col--5 {
  max-width: 20.8333%;
  flex: 0 0 20.8333%;
}
.easy-col--6 {
  max-width: 25%;
  flex: 0 0 25%;
}
.easy-col--7 {
  max-width: 29.1667%;
  flex: 0 0 29.1667%;
}
.easy-col--8 {
  max-width: 33.3333%;
  flex: 0 0 33.3333%;
}
.easy-col--9 {
  max-width: 37.5%;
  flex: 0 0 37.5%;
}
.easy-col--10 {
  max-width: 41.6667%;
  flex: 0 0 41.6667%;
}
.easy-col--11 {
  max-width: 45.8333%;
  flex: 0 0 45.8333%;
}
.easy-col--12 {
  max-width: 50%;
  flex: 0 0 50%;
}
.easy-col--13 {
  max-width: 54.1667%;
  flex: 0 0 54.1667%;
}
.easy-col--14 {
  max-width: 58.3333%;
  flex: 0 0 58.3333%;
}
.easy-col--15 {
  max-width: 62.5%;
  flex: 0 0 62.5%;
}
.easy-col--16 {
  max-width: 66.6667%;
  flex: 0 0 66.6667%;
}
.easy-col--17 {
  max-width: 70.8333%;
  flex: 0 0 70.8333%;
}
.easy-col--18 {
  max-width: 75%;
  flex: 0 0 75%;
}
.easy-col--19 {
  max-width: 79.1667%;
  flex: 0 0 79.1667%;
}
.easy-col--20 {
  max-width: 83.3333%;
  flex: 0 0 83.3333%;
}
.easy-col--21 {
  max-width: 87.5%;
  flex: 0 0 87.5%;
}
.easy-col--22 {
  max-width: 91.6667%;
  flex: 0 0 91.6667%;
}
.easy-col--23 {
  max-width: 95.8333%;
  flex: 0 0 95.8333%;
}
.easy-col--24 {
  max-width: 100%;
  flex: 0 0 100%;
}

/* offset */
.easy-col--offset-1 {
  margin-left: 4.1667%;
}
.easy-col--offset-2 {
  margin-left: 8.3333%;
}
.easy-col--offset-3 {
  margin-left: 12.5%;
}
.easy-col--offset-4 {
  margin-left: 16.6667%;
}
.easy-col--offset-5 {
  margin-left: 20.8333%;
}
.easy-col--offset-6 {
  margin-left: 25%;
}
.easy-col--offset-7 {
  margin-left: 29.1667%;
}
.easy-col--offset-8 {
  margin-left: 33.3333%;
}
.easy-col--offset-9 {
  margin-left: 37.5%;
}
.easy-col--offset-10 {
  margin-left: 41.6667%;
}
.easy-col--offset-11 {
  margin-left: 45.8333%;
}
.easy-col--offset-12 {
  margin-left: 50%;
}
.easy-col--offset-13 {
  margin-left: 54.1667%;
}
.easy-col--offset-14 {
  margin-left: 58.3333%;
}
.easy-col--offset-15 {
  margin-left: 62.5%;
}
.easy-col--offset-16 {
  margin-left: 66.6667%;
}
.easy-col--offset-17 {
  margin-left: 70.8333%;
}
.easy-col--offset-18 {
  margin-left: 75%;
}
.easy-col--offset-19 {
  margin-left: 79.1667%;
}
.easy-col--offset-20 {
  margin-left: 83.3333%;
}
.easy-col--offset-21 {
  margin-left: 87.5%;
}
.easy-col--offset-22 {
  margin-left: 91.6667%;
}
.easy-col--offset-23 {
  margin-left: 95.8333%;
}
.easy-col--offset-24 {
  margin-left: 100%;
}

/* push / pull */
@for $i from 0 through 24 {
  .easy-col--push-#{$i} {
    left: math.div($i, 24) * 100%;
  }
  .easy-col--pull-#{$i} {
    right: math.div($i, 24) * 100%;
  }
}

/* 响应式断点 */
@media (max-width: 767px) {
  @for $i from 0 through 24 {
    .easy-col--xs-#{$i} {
      max-width: math.div($i, 24) * 100%;
      flex: 0 0 math.div($i, 24) * 100%;
    }
    .easy-col--xs-offset-#{$i} {
      margin-left: math.div($i, 24) * 100%;
    }
  }
}
@media (min-width: 768px) {
  @for $i from 0 through 24 {
    .easy-col--sm-#{$i} {
      max-width: math.div($i, 24) * 100%;
      flex: 0 0 math.div($i, 24) * 100%;
    }
    .easy-col--sm-offset-#{$i} {
      margin-left: math.div($i, 24) * 100%;
    }
  }
}
@media (min-width: 992px) {
  @for $i from 0 through 24 {
    .easy-col--md-#{$i} {
      max-width: math.div($i, 24) * 100%;
      flex: 0 0 math.div($i, 24) * 100%;
    }
    .easy-col--md-offset-#{$i} {
      margin-left: math.div($i, 24) * 100%;
    }
  }
}
@media (min-width: 1200px) {
  @for $i from 0 through 24 {
    .easy-col--lg-#{$i} {
      max-width: math.div($i, 24) * 100%;
      flex: 0 0 math.div($i, 24) * 100%;
    }
    .easy-col--lg-offset-#{$i} {
      margin-left: math.div($i, 24) * 100%;
    }
  }
}
@media (min-width: 1920px) {
  @for $i from 0 through 24 {
    .easy-col--xl-#{$i} {
      max-width: math.div($i, 24) * 100%;
      flex: 0 0 math.div($i, 24) * 100%;
    }
    .easy-col--xl-offset-#{$i} {
      margin-left: math.div($i, 24) * 100%;
    }
  }
}
</style>
