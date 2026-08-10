<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

defineOptions({ name: 'EasyDictTag' })

const props = withDefaults(defineProps<DictTagProps>(), {
  multiple: false,
  size: 'default',
  effect: 'light',
  round: false,
  labelField: 'labelValue',
  valueField: 'id',
})

// ============================================================
// 字典数据类型定义
// ============================================================
export interface DictItem {
  /** 值字段（默认 id） */
  id?: string | number
  /** 显示文本字段（默认 labelValue） */
  labelValue?: string
  /** Tag 样式类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 自定义颜色 */
  color?: string
  /** 图标名称（el: 前缀 = Element Plus 图标，如 el:User）。需要配合 show-icon 属性使用 */
  icon?: string
  /** 允许任意额外字段 */
  [key: string]: any
}

export interface DictTagProps {
  /** 绑定值：单选为 string，多选为 string | string[]（支持逗号拼接字符串） */
  value?: string | string[] | number | null
  /** 字典类型标识，组件内部根据此值请求字典数据 */
  dictType: string
  /** 是否多选模式 */
  multiple?: boolean
  /** 标签尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 主题效果 */
  effect?: 'light' | 'plain' | 'dark'
  /** 是否圆角 */
  round?: boolean
  /** label 显示字段名，默认 labelValue */
  labelField?: string
  /** value 匹配字段名，默认 id */
  valueField?: string
}

// ============================================================
// 字典请求函数
// ============================================================
// ⚙️ 二开指南：将此函数替换为您自己的接口请求
// 例如：
//   import { getDictList } from '../../../easy-ui/src/api/system/dict'
//   async function fetchDictList(dictType: string): Promise<DictItem[]> {
//     const res = await getDictList({ dictType })
//     return res.data
//   }
//
// 返回数组中每条数据至少包含 valueField（默认 id）和 labelField（默认 labelValue）两个字段
// 可额外携带 type / color / icon 字段控制 Tag 样式
async function fetchDictList(dictType: string): Promise<DictItem[]> {
  // 模拟网络延迟
  await new Promise(r => setTimeout(r, 300))

  const mockData: Record<string, DictItem[]> = {
    // 用户状态
    user_status: [
      { id: '1', labelValue: '正常', type: 'success' },
      { id: '2', labelValue: '禁用', type: 'danger' },
      { id: '3', labelValue: '待激活', type: 'warning' },
      { id: '4', labelValue: '已注销', type: 'info' },
    ],
    // 审批状态
    approve_status: [
      { id: '0', labelValue: '待审批', type: 'warning' },
      { id: '1', labelValue: '审批中', type: 'primary' },
      { id: '2', labelValue: '已通过', type: 'success' },
      { id: '3', labelValue: '已拒绝', type: 'danger' },
      { id: '4', labelValue: '已撤回', type: 'info' },
    ],
    // 性别（el: 前缀 = Element Plus 图标）
    gender: [
      { id: '1', labelValue: '男', type: 'primary', icon: 'el:Male' },
      { id: '2', labelValue: '女', type: 'danger', icon: 'el:Female' },
      { id: '0', labelValue: '未知', type: 'info' },
    ],
    // 优先级
    priority: [
      { id: 'low', labelValue: '低', color: '#34c759' },
      { id: 'medium', labelValue: '中', color: '#f5a623' },
      { id: 'high', labelValue: '高', color: '#ff3b30' },
      { id: 'urgent', labelValue: '紧急', color: '#af52de' },
    ],
    // 订单状态
    order_status: [
      { id: '1', labelValue: '待付款', type: 'warning' },
      { id: '2', labelValue: '待发货', type: 'primary' },
      { id: '3', labelValue: '已发货', type: 'primary' },
      { id: '4', labelValue: '已完成', type: 'success' },
      { id: '5', labelValue: '已取消', type: 'info' },
      { id: '6', labelValue: '退款中', type: 'danger' },
    ],
    // 角色类型
    role_type: [
      { id: 'admin', labelValue: '超级管理员', type: 'danger' },
      { id: 'manager', labelValue: '管理员', type: 'warning' },
      { id: 'editor', labelValue: '编辑者', type: 'primary' },
      { id: 'viewer', labelValue: '查看者', type: 'info' },
    ],
    // 自定义字段演示（code → name）
    custom_field_demo: [
      { code: 'active', name: '启用中', type: 'success' },
      { code: 'inactive', name: '已停用', type: 'danger' },
      { code: 'pending', name: '待审核', type: 'warning' },
    ],
  }

  return mockData[dictType] ?? []
}

// ============================================================
// 状态
// ============================================================
const dictList = ref<DictItem[]>([])
const loading = ref(false)

async function loadDict() {
  if (!props.dictType)
    return
  loading.value = true
  try {
    dictList.value = await fetchDictList(props.dictType)
  }
  finally {
    loading.value = false
  }
}

onMounted(loadDict)
watch(() => props.dictType, loadDict)

// ============================================================
// 计算：解析值
// ============================================================
/** 是否有值 */
const hasValue = computed(() => {
  if (props.value === undefined || props.value === null || props.value === '')
    return false
  if (Array.isArray(props.value))
    return props.value.length > 0
  return true
})

/** 将多选值统一转为数组 */
const multipleValues = computed<string[]>(() => {
  if (!hasValue.value)
    return []
  const v = props.value
  if (Array.isArray(v))
    return v.map(String)
  if (typeof v === 'string') {
    return v
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }
  return [String(v)]
})

/** 单选：找到对应的字典项 */
const singleItem = computed<DictItem | null>(() => {
  if (!hasValue.value || dictList.value.length === 0)
    return null
  const strVal = String(props.value)
  return dictList.value.find(item => String(item[props.valueField]) === strVal) ?? null
})

/** 多选：找到所有对应的字典项 */
const multipleItems = computed<DictItem[]>(() => {
  if (!hasValue.value || dictList.value.length === 0)
    return []
  return multipleValues.value
    .map(v => dictList.value.find(item => String(item[props.valueField]) === v))
    .filter((item): item is DictItem => Boolean(item))
})

// ============================================================
// 自定义颜色样式生成
// ============================================================
function buildColorStyle(color: string) {
  if (props.effect === 'dark') {
    return { backgroundColor: color, borderColor: color, color: '#fff' }
  }
  if (props.effect === 'plain') {
    return { backgroundColor: 'transparent', borderColor: color, color }
  }
  return { backgroundColor: `${color}1a`, borderColor: `${color}40`, color }
}
</script>

<template>
  <span v-if="!multiple" class="easy-dict-tag__single">
    <span v-if="loading" class="easy-dict-tag__loading">
      <span class="easy-dict-tag__dot" />
    </span>
    <template v-else-if="singleItem">
      <span
        class="easy-tag"
        :class="[
          `easy-tag--${singleItem.type || 'default'}`,
          `easy-tag--${size}`,
          `easy-tag--${effect}`,
          { 'is-round': round },
        ]"
        :style="singleItem.color ? buildColorStyle(singleItem.color) : {}"
      >
        <!-- 🔌 图标：如不需要图标，删除以下一行 -->
        <easy-icon v-if="singleItem.icon" :name="singleItem.icon" />
        <span class="easy-tag__text">{{ singleItem[labelField] }}</span>
      </span>
    </template>
    <span v-else-if="value !== undefined && value !== null && value !== ''" class="easy-dict-tag__fallback">
      {{ value }}
    </span>
  </span>

  <!-- 多选模式 -->
  <span v-else class="easy-dict-tag__multiple">
    <span v-if="loading" class="easy-dict-tag__loading">
      <span class="easy-dict-tag__dot" />
    </span>
    <template v-else>
      <template v-if="multipleItems.length > 0">
        <span
          v-for="item in multipleItems"
          :key="item[valueField]"
          class="easy-tag"
          :class="[
            `easy-tag--${item.type || 'default'}`,
            `easy-tag--${size}`,
            `easy-tag--${effect}`,
            { 'is-round': round },
          ]"
          :style="item.color ? buildColorStyle(item.color) : {}"
        >
          <!-- 🔌 图标：如不需要图标，删除以下一行 -->
          <easy-icon v-if="item.icon" :name="item.icon" />
          <span class="easy-tag__text">{{ item[labelField] }}</span>
        </span>
      </template>
      <span v-else-if="hasValue" class="easy-dict-tag__fallback">
        {{ Array.isArray(value) ? (value as string[]).join('，') : value }}
      </span>
    </template>
  </span>
</template>

<style scoped lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

/* ====================================================
   复用 easy-tag 核心样式（独立副本，避免跨组件依赖）
==================================================== */
$radius: 6px;
$radius-round: 100px;
$transition: all 0.2s ease;

.easy-dict-tag__single,
.easy-dict-tag__multiple {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

/* 加载占位点 */
.easy-dict-tag__loading {
  display: inline-flex;
  align-items: center;
}
.easy-dict-tag__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c0c4cc;
  animation: easy-dict-blink 1s ease-in-out infinite;
}
@keyframes easy-dict-blink {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 降级显示（未匹配到字典项时直接显示值） */
.easy-dict-tag__fallback {
  font-size: 13px;
  color: $text-regular;
}

/* ====================================================
   Tag 基础样式（独立于 easy-tag 组件）
==================================================== */
.easy-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  height: 28px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  border-radius: $radius;
  border: 1px solid transparent;
  transition: $transition;
  white-space: nowrap;
  vertical-align: middle;
  box-sizing: border-box;
  user-select: none;

  &.is-round {
    border-radius: $radius-round;
  }

  &.easy-tag--large {
    height: 34px;
    font-size: 14px;
    padding: 0 14px;
    gap: 5px;
  }
  &.easy-tag--small {
    height: 22px;
    font-size: 12px;
    padding: 0 7px;
    gap: 3px;
  }

  /* --- default --- */
  &.easy-tag--default {
    &.easy-tag--light {
      color: var(--el-text-color-regular);
      background-color: var(--el-fill-color-light);
      border-color: var(--el-border-color);
    }
    &.easy-tag--plain {
      color: var(--el-text-color-regular);
      background-color: transparent;
      border-color: var(--el-border-color);
    }
    &.easy-tag--dark {
      color: #fff;
      background-color: #909399;
      border-color: #909399;
    }
  }
  /* --- primary --- */
  &.easy-tag--primary {
    &.easy-tag--light {
      color: var(--el-color-primary);
      background-color: $primary-bg-strong;
      border-color: $primary-border;
    }
    &.easy-tag--plain {
      color: var(--el-color-primary);
      background-color: transparent;
      border-color: var(--el-color-primary);
    }
    &.easy-tag--dark {
      color: #fff;
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
  }
  /* --- success --- */
  &.easy-tag--success {
    &.easy-tag--light {
      color: var(--el-color-success);
      background-color: $success-bg;
      border-color: $success-border;
    }
    &.easy-tag--plain {
      color: var(--el-color-success);
      background-color: transparent;
      border-color: var(--el-color-success);
    }
    &.easy-tag--dark {
      color: #fff;
      background-color: var(--el-color-success);
      border-color: var(--el-color-success);
    }
  }
  /* --- warning --- */
  &.easy-tag--warning {
    &.easy-tag--light {
      color: var(--el-color-warning);
      background-color: $warning-bg;
      border-color: $warning-border;
    }
    &.easy-tag--plain {
      color: var(--el-color-warning);
      background-color: transparent;
      border-color: var(--el-color-warning);
    }
    &.easy-tag--dark {
      color: #fff;
      background-color: var(--el-color-warning);
      border-color: var(--el-color-warning);
    }
  }
  /* --- danger --- */
  &.easy-tag--danger {
    &.easy-tag--light {
      color: var(--el-color-danger);
      background-color: rgba(255, 59, 48, 0.1);
      border-color: rgba(255, 59, 48, 0.25);
    }
    &.easy-tag--plain {
      color: var(--el-color-danger);
      background-color: transparent;
      border-color: var(--el-color-danger);
    }
    &.easy-tag--dark {
      color: #fff;
      background-color: var(--el-color-danger);
      border-color: var(--el-color-danger);
    }
  }
  /* --- info --- */
  &.easy-tag--info {
    &.easy-tag--light {
      color: var(--el-color-info);
      background-color: $info-bg;
      border-color: $info-border;
    }
    &.easy-tag--plain {
      color: var(--el-color-info);
      background-color: transparent;
      border-color: var(--el-color-info);
    }
    &.easy-tag--dark {
      color: #fff;
      background-color: var(--el-color-info);
      border-color: var(--el-color-info);
    }
  }
}

.easy-tag__text {
  line-height: 1;
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-dict-tag__fallback {
  color: var(--el-text-color-regular);
}
html.dark .easy-tag--default.easy-tag--light {
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color);
}
html.dark .easy-tag--default.easy-tag--dark {
  background-color: #666;
  border-color: #666;
}
html.dark .easy-tag--default.easy-tag--plain {
  color: var(--el-text-color-secondary);
  border-color: var(--el-border-color);
}
</style>
