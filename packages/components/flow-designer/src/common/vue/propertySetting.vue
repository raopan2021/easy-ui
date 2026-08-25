<script setup lang="ts">
import type { PropertySettingProps } from './property-setting-types'

import EasyModal from '../../../../modal'
import { usePropertySetting } from './use-property-setting'

const props = withDefaults(defineProps<PropertySettingProps>(), {
  value: () => ({}),
  node: () => ({}),
  lf: () => null,
  disabled: false,
  skipConditionShow: true,
  nodes: () => [],
  skips: () => [],
})

const {
  drawer,
  form,
  title,
  componentType,
  show,
  handleClose,
} = usePropertySetting(props)

defineExpose({
  show,
  handleClose,
})

export type { PropertySettingProps } from './property-setting-types'
</script>

<template>
  <div>
    <EasyModal v-model="drawer" :title="title" width="40%" @close="handleClose" @confirm="handleClose">
      <div style="height: 500px">
        <component :is="componentType" :ref="componentType.name" v-model="form" :disabled="disabled"
          :skip-condition-show="skipConditionShow" :nodes="nodes" :skips="skips">
          <template v-for="(item, key) in $slots" #[key]="data">
            <slot :name="key" v-bind="data || {}" />
          </template>
        </component>
      </div>
    </EasyModal>
  </div>
</template>

<style scoped src="./property-setting-style.scss" lang="scss"></style>
