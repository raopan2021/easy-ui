import type { PropertySettingProps } from './property-setting-types'

/**
 * 节点属性设置弹框（PropertySetting）组合式逻辑。
 *
 * 从原 propertySetting.vue 抽离：根据 props.node 动态切换子表单、监听表单变化回写
 * LogicFlow 节点/边属性、弹框开关与校验。.vue 仅承担组合 + 模板渲染，
 * 保持对外 props / defineExpose 完全一致。
 */
import { computed, getCurrentInstance, ref, watch } from 'vue'
// 子表单组件（COMPONENT_LIST 动态切换所需，由组合式逻辑持有并传递给模板 <component :is>）
import between from './between.vue'
import end from './end.vue'
import serial from './gateway.vue'
import skip from './skip.vue'
import start from './start.vue'

export function usePropertySetting(props: PropertySettingProps) {
  const proxy = getCurrentInstance()!.proxy!

  // 子组件注册表（serial 与 parallel 共用 gateway 表单）
  const parallel = serial
  const COMPONENT_LIST = {
    start,
    between,
    serial,
    parallel,
    end,
    skip,
  }

  const drawer = ref(false)
  const form = ref<any>({})
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
    return (COMPONENT_LIST as Record<string, any>)[props.node.type]
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
            if (skipCondition && (skipCondition.startsWith('spel') || skipCondition.startsWith('default'))) {
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
              = Number.parseFloat(nodeRatio) === 0 ? '1' : Number.parseFloat(nodeRatio) === 100 ? '3' : nodeRatio ? '2' : '1'
          }
          if (n.properties.collaborativeWay === '2' && !n.properties.nodeRatio)
            n.properties.nodeRatio = '50'
          n.properties.formCustom = JSON.stringify(n.properties) === '{}' ? 'N' : n.properties.formCustom || ''
          const listenerTypes = n.properties.listenerType ? n.properties.listenerType.split(',') : []
          const listenerPaths = n.properties.listenerPath ? n.properties.listenerPath.split('@@') : []
          n.properties.listenerRows = listenerTypes.map((type: any, index: number) => ({
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
    () => form.value.listenerRows?.map((e: any) => e.listenerType),
    (n) => {
      // 监听监听器类型变化并更新
      props.lf.setProperties(objId.value, {
        listenerType: Array.isArray(n) ? n.join(',') : n,
      })
    },
  )

  // 监听：监听器路径数组
  watch(
    () => form.value.listenerRows?.map((e: any) => e.listenerPath),
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
    const targetRef: any = proxy.$refs[componentType.value?.name]
    if (!props.disabled && typeof targetRef?.validate === 'function') {
      // 校验表单必填项
      await targetRef
        .validate()
        .then(() => {
          handleDrawer()
        })
        .catch((_err: any) => {

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

  return {
    drawer,
    form,
    title,
    componentType,
    show,
    handleClose,
  }
}
