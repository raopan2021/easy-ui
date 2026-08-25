<script setup lang="ts">
import type { FlowDesignerEmits, FlowDesignerProps } from './flow-designer-types'

import PropertySetting from './common/vue/propertySetting.vue'
import EdgeTooltip from './mimic/vue/EdgeTooltip.vue'
import { useFlowDesigner } from './use-flow-designer'
import '@logicflow/core/lib/style/index.css'
import '@logicflow/extension/lib/style/index.css'

const props = withDefaults(defineProps<FlowDesignerProps>(), {
  flow: null,
})

const emit = defineEmits<FlowDesignerEmits>()

const {
  headerStyle,
  containerRef,
  propertySettingRef,
  nodeClick,
  lf,
  disabled,
  skipConditionShow,
  nodes,
  skips,
  logicJson,
  tooltipVisible,
  tooltipPosition,
  tooltipEdge,
  handleOptionClick,
  activeStep,
  undoOrRedo,
  zoomViewport,
  downLoad,
  downJson,
  saveJsonModel,
} = useFlowDesigner(props, emit)

export type { FlowDesignerEmits, FlowDesignerProps, Props } from './flow-designer-types'
</script>

<template>
  <div style="background-color: var(--el-fill-color)">
    <el-header :style="headerStyle">
      <div style="padding: 5px 0; text-align: right">
        <el-button size="small" icon="ZoomOut" @click="zoomViewport(false)">
          缩小
        </el-button>
        <el-button v-if="'CLASSICS' === logicJson.modelValue" size="small" icon="Rank" @click="zoomViewport(1)">
          自适应
        </el-button>
        <el-button size="small" icon="ZoomIn" @click="zoomViewport(true)">
          放大
        </el-button>
        <el-button size="small" icon="DArrowLeft" @click="undoOrRedo(true)">
          上一步
        </el-button>
        <el-button size="small" icon="DArrowRight" @click="undoOrRedo(false)">
          下一步
        </el-button>
        <el-button size="small" icon="Download" @click="downLoad">
          下载流程图
        </el-button>
        <el-button size="small" icon="Download" @click="downJson">
          下载json
        </el-button>
        <el-button size="small" type="primary" @click="saveJsonModel">
          保存
        </el-button>
      </div>

      <div v-show="activeStep === 1" ref="containerRef" class="container">
        <PropertySetting
          ref="propertySettingRef" :node="nodeClick" :lf="lf" :disabled="disabled"
          :skip-condition-show="skipConditionShow" :nodes="nodes" :skips="skips"
        />
      </div>
    </el-header>
  </div>

  <!-- 弹框组件 -->
  <EdgeTooltip
    v-if="tooltipVisible" :position="tooltipPosition" :tooltip-edge="tooltipEdge"
    @option-click="handleOptionClick" @close-tooltip="tooltipVisible = false"
  />
</template>

<!-- 组件核心样式（scoped，独立维护在 flow-designer-style.scss） -->
<style scoped src="./flow-designer-style.scss" lang="scss"></style>
