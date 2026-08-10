<script setup lang="ts">
import EasyModal from '../../../../modal'
import between from './between'
import end from './end'
import serial from './gateway'
import skip from './skip'
import start from './start'

const props = defineProps({
  value: {
    type: Object,
    default() {
      return {}
    },
  },
  node: {
    type: Object,
    default() {
      return {}
    },
  },
  lf: {
    type: Object,
    default() {
      return null
    },
  },
  disabled: {
    // 是否禁止
    type: Boolean,
    default: false,
  },
  skipConditionShow: {
    // 是否显示跳转条件
    type: Boolean,
    default: true,
  },
  nodes: {
    type: Array,
    default() {
      return []
    },
  },
  skips: {
    type: Array,
    default() {
      return []
    },
  },
})

const parallel = serial

const { proxy } = getCurrentInstance()

const COMPONENT_LIST = {
  start,
  between,
  serial,
  parallel,
  end,
  skip,
}

const drawer = ref(false)
const form = ref({})
const objId = ref(undefined)
const nodeCode = ref(null)
const title = computed(() => {
  if (props.node && props.node.type === 'skip') {
    return '设置边属性'
  }
  else if (props.node && props.node.type === 'serial') {
    return '设置串行网关属性'
  }
  else if (props.node && props.node.type === 'parallel') {
    return '设置并行网关属性'
  }
  else if (props.node && props.node.type === 'start') {
    return '设置开始属性'
  }
  else if (props.node && props.node.type === 'end') {
    return '设置结束属性'
  }
  return '设置中间属性'
})

// 组件类型
const componentType = computed(() => {
  if (!props.node || !props.node.type)
    return
  return COMPONENT_LIST[props.node.type]
})

watch(
  () => props.node,
  (n) => {
    if (n) {
      objId.value = n.id
      if (n.type === 'skip') {
        const skipCondition = n.properties.skipCondition
        let condition
        let conditionType
        let conditionValue = ''
        if (skipCondition) {
          const conditionSpl = skipCondition.split('@@')
          if (skipCondition && (/^spel/.test(skipCondition) || /^default/.test(skipCondition))) {
            conditionType = conditionSpl && conditionSpl.length > 0 ? conditionSpl[0] : ''
            conditionValue = conditionSpl && conditionSpl.length > 1 ? conditionSpl[1] : ''
          }
          else if (skipCondition) {
            conditionType = conditionSpl && conditionSpl.length > 0 ? conditionSpl[0] : ''
            const conditionOneSpl = conditionSpl[1].split('|')
            condition = conditionOneSpl && conditionOneSpl.length > 0 ? conditionOneSpl[0] : ''
            conditionValue = conditionOneSpl && conditionOneSpl.length > 1 ? conditionOneSpl[1] : ''
          }
        }

        form.value = {
          nodeType: n.type,
          skipType: n.properties.skipType,
          skipName: n.text instanceof Object ? n.text.value : n.text,
          skipCondition,
          condition,
          conditionType,
          conditionValue,
        }
      }
      else {
        if (!n.properties.collaborativeWay) {
          const nodeRatio = n.properties.nodeRatio || ''
          n.properties.collaborativeWay
            = parseFloat(nodeRatio) === 0 ? '1' : parseFloat(nodeRatio) === 100 ? '3' : nodeRatio ? '2' : '1'
        }
        if (n.properties.collaborativeWay === '2' && !n.properties.nodeRatio)
          n.properties.nodeRatio = '50'
        n.properties.formCustom = JSON.stringify(n.properties) === '{}' ? 'N' : n.properties.formCustom || ''
        const listenerTypes = n.properties.listenerType ? n.properties.listenerType.split(',') : []
        const listenerPaths = n.properties.listenerPath ? n.properties.listenerPath.split('@@') : []
        n.properties.listenerRows = listenerTypes.map((type, index) => ({
          listenerType: type,
          listenerPath: listenerPaths[index],
        }))
        form.value = {
          nodeType: n.type,
          nodeCode: n.id,
          ...n.properties,
          nodeName: n.text instanceof Object ? n.text.value : n.text,
        }
      }
    }
  },
)

watch(
  () => form.value.nodeCode,
  (n) => {
    nodeCode.value = n
  },
)

watch(
  () => form.value.skipType,
  (n) => {
    // 监听跳转属性变化并更新
    props.lf.setProperties(objId.value, {
      skipType: n,
    })
  },
)

watch(
  () => form.value.nodeName,
  (n) => {
    // 更新流程节点上的文本内容
    props.lf.updateText(objId.value, n)
    // 监听节点名称变化并更新
    props.lf.setProperties(objId.value, {
      nodeName: n,
    })
  },
)

watch(
  () => form.value.collaborativeWay,
  (n) => {
    // 监听节点属性变化并更新
    props.lf.setProperties(objId.value, {
      nodeRatio: n === '1' ? '0' : n === '3' ? '100' : '50',
    })
  },
)

watch(
  () => form.value.nodeRatio,
  (n) => {
    // 监听节点属性变化并更新
    props.lf.setProperties(objId.value, {
      nodeRatio: n,
    })
  },
)

watch(
  () => form.value.permissionFlag,
  (n) => {
    // 监听节点属性变化并更新
    props.lf.setProperties(objId.value, {
      permissionFlag: Array.isArray(n) ? n.filter(e => e).join('@@') : n,
    })
  },
  { deep: true },
)

watch(
  () => form.value.anyNodeSkip,
  (n) => {
    // 监听跳转属性变化并更新
    props.lf.setProperties(objId.value, {
      anyNodeSkip: n,
    })
  },
)

// 监听：监听器路类型数组
watch(
  () => form.value.listenerRows?.map(e => e.listenerType),
  (n) => {
    // 监听监听器类型变化并更新
    props.lf.setProperties(objId.value, {
      listenerType: Array.isArray(n) ? n.join(',') : n,
    })
  },
)

// 监听：监听器路径数组
watch(
  () => form.value.listenerRows?.map(e => e.listenerPath),
  (n) => {
    // 监听监听器类型变化并更新
    props.lf.setProperties(objId.value, {
      listenerPath: Array.isArray(n) ? n.join('@@') : n,
    })
  },
)

watch(
  () => form.value.formCustom,
  (n) => {
    props.lf.setProperties(objId.value, {
      formCustom: n || '',
    })
  },
)

watch(
  () => form.value.formPath,
  (n) => {
    props.lf.setProperties(objId.value, {
      formPath: n,
    })
  },
)

watch(
  () => form.value.skipName,
  (n) => {
    if (['skip'].includes(props.node.type)) {
      // 监听跳转名称变化并更新
      props.lf.updateText(objId.value, n)
      // 监听跳转属性变化并更新
      props.lf.setProperties(objId.value, {
        skipName: n,
      })
    }
  },
)

watch(
  () => form.value.skipCondition,
  (n) => {
    // 监听跳转属性变化并更新
    props.lf.setProperties(objId.value, {
      skipCondition: n,
    })
  },
)

watch(
  () => form.value.ext,
  (n) => {
    // 监听节点属性变化并更新
    props.lf.setProperties(objId.value, {
      ext: n,
    })
  },
  { deep: true },
)

function show() {
  drawer.value = true
}

async function handleClose() {
  if (!props.disabled && typeof proxy.$refs[componentType.value?.name]?.validate === 'function') {
    // 校验表单必填项
    await proxy.$refs[componentType.value.name]
      .validate()
      .then(() => {
        handleDrawer()
      })
      .catch((_err) => {

      })
  }
  else {
    handleDrawer()
  }
  drawer.value = false
}

function handleDrawer() {
  if (nodeCode.value && objId.value) {
    if (['skip'].includes(props.node?.type)) {
      if (!props.lf.getEdgeModelById(nodeCode.value)) {
        props.lf.changeEdgeId(objId.value, nodeCode.value)
      }
    }
    else {
      if (!props.lf.getNodeModelById(nodeCode.value)) {
        props.lf.changeNodeId(objId.value, nodeCode.value)
      }
    }
  }
  drawer.value = false
}

defineExpose({
  show,
  handleClose,
})
</script>

<template>
  <div>
    <EasyModal v-model="drawer" :title="title" width="40%" @close="handleClose" @confirm="handleClose">
      <div style="height: 500px">
        <component
          :is="componentType"
          :ref="componentType.name"
          v-model="form"
          :disabled="disabled"
          :skip-condition-show="skipConditionShow"
          :nodes="nodes"
          :skips="skips"
        >
          <template v-for="(item, key) in $slots" #[key]="data">
            <slot :name="key" v-bind="data || {}" />
          </template>
        </component>
      </div>
    </EasyModal>
  </div>
</template>

<style scoped>
.el-drawer__container ::-webkit-scrollbar {
  display: none;
}
</style>
