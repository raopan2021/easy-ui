import type { UserItem, UserPickerEmits, UserPickerProps } from './types'

import { computed, onMounted, ref } from 'vue'

import { getMockUsers } from './mock-users'

/**
 * EasyUserPicker 核心逻辑 composable
 *
 * 将原本内联在 user-picker.vue 中的用户数据加载、选择/移除、搜索、
 * 弹窗开关与值回传等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 用户选择器 props（需传入响应式对象）
 * @param emit  用户选择器事件触发函数（callable 形式，见 UserPickerEmits）
 */
export function useUserPicker(props: UserPickerProps, emit: UserPickerEmits) {
  // 字段名默认值（props 可选，composable 内统一兜底）
  const valueKey = props.valueKey ?? 'id'
  const nameKey = props.nameKey ?? 'name'
  const avatarKey = props.avatarKey ?? 'avatar'
  const extraKey = props.extraKey ?? 'department'

  // ========== 弹窗状态 ==========
  const visible = ref(false)
  const searchText = ref('')
  const tempSelected = ref<UserItem[]>([])
  const userList = ref<UserItem[]>([])
  const loading = ref(false)

  // 组件挂载时加载数据
  onMounted(async () => {
    await loadUsers()
  })

  // ========== 选中态解析 ==========
  /** 根据 modelValue 解析为数组 */
  function parseModelValue(val: any): (number | string)[] {
    if (val === null || val === undefined)
      return []
    if (Array.isArray(val))
      return val.map(v => String(v))
    // 单选模式：可能是单个值，也可能是逗号拼接的字符串
    if (typeof val === 'string' && val.includes(',')) {
      return val.split(',').filter(Boolean)
    }
    return [String(val)]
  }

  /** 根据 modelValue 反查出用户对象列表 */
  const selectedUsers = computed(() => {
    const values = parseModelValue(props.modelValue)
    if (values.length === 0)
      return []

    // 构建 valueKey -> user 的映射
    const valueMap = new Map<string, UserItem>()
    userList.value.forEach((user) => {
      valueMap.set(String(user[valueKey]), user)
    })

    return values.map(v => valueMap.get(String(v))).filter((u): u is UserItem => !!u)
  })

  /** 过滤后的用户列表（按搜索关键词过滤姓名/额外信息） */
  const filteredUsers = computed(() => {
    if (!searchText.value)
      return userList.value
    const keyword = searchText.value.toLowerCase()
    return userList.value.filter((user) => {
      const name = String(user[nameKey] || '').toLowerCase()
      const extra = String(user[extraKey] || '').toLowerCase()
      return name.includes(keyword) || extra.includes(keyword)
    })
  })

  // ========== 判断 ==========
  /** 判断用户是否已选 */
  function isSelected(user: UserItem): boolean {
    const value = user[valueKey]
    return tempSelected.value.some(u => u[valueKey] === value)
  }

  /** 判断用户是否禁用 */
  function isDisabled(user: UserItem): boolean {
    return props.isDisabled?.(user) ?? false
  }

  /** 获取姓名首字母（头像占位文字） */
  function getInitials(user: UserItem): string {
    const name = String(user[nameKey] || '')
    if (!name)
      return '?'
    const match = name.match(/^[a-z]/i)
    if (match)
      return match[0].toUpperCase()
    return name.slice(0, 2)
  }

  // ========== 数据加载 ==========
  async function loadUsers(keyword?: string) {
    loading.value = true
    try {
      userList.value = await getMockUsers(keyword)
    }
    finally {
      loading.value = false
    }
  }

  // ========== 弹窗开关 ==========
  function handleOpen() {
    if (props.disabled)
      return
    visible.value = true
    tempSelected.value = [...selectedUsers.value]
    searchText.value = ''
  }

  function handleClose() {
    visible.value = false
  }

  // ========== 选择 / 移除 ==========
  function handleSelect(user: UserItem) {
    if (isDisabled(user))
      return

    const value = user[valueKey]
    const index = tempSelected.value.findIndex(u => u[valueKey] === value)

    if (props.multiple) {
      if (index > -1) {
        tempSelected.value.splice(index, 1)
      }
      else {
        if (tempSelected.value.length < (props.max ?? 999)) {
          tempSelected.value.push(user)
        }
      }
    }
    else {
      tempSelected.value = [user]
    }
  }

  function handleRemove(user: UserItem) {
    if (props.disabled)
      return

    const value = user[valueKey]

    if (props.multiple) {
      const currentValues = parseModelValue(props.modelValue)
      const idx = currentValues.findIndex(v => String(v) === String(value))
      if (idx > -1) {
        currentValues.splice(idx, 1)
        emitValue(currentValues as any)
      }
    }
    else {
      emitValue(null)
    }
  }

  // ========== 确认 / 回传 ==========
  function handleConfirm() {
    // 从 tempSelected 提取 valueKey 值
    const values = tempSelected.value.map(u => u[valueKey])

    if (props.multiple) {
      emitValue(values)
    }
    else {
      emitValue(values[0] || null)
    }

    emit('pick')
    handleClose()
  }

  /** 发送值（多选 + returnType=string 时转逗号拼接字符串） */
  function emitValue(value: number | string | number[] | string[] | null) {
    let emitVal = value

    // 多选且 returnType 为 string 时，转换为逗号拼接字符串
    if (props.multiple && Array.isArray(value) && props.returnType === 'string') {
      emitVal = value.join(',')
    }

    emit('update:modelValue', emitVal)
    emit('change', emitVal)
  }

  // ========== 搜索 / 清空 ==========
  async function handleSearch() {
    await loadUsers(searchText.value)
  }

  function clear() {
    const empty = props.multiple ? [] : null
    emit('update:modelValue', empty)
    emit('change', empty)
  }

  return {
    // 状态
    visible,
    searchText,
    tempSelected,
    userList,
    loading,
    // 字段名
    valueKey,
    nameKey,
    avatarKey,
    extraKey,
    // 计算
    selectedUsers,
    filteredUsers,
    // 判断
    isSelected,
    isDisabled,
    getInitials,
    // 弹窗
    handleOpen,
    handleClose,
    // 选择 / 移除
    handleSelect,
    handleRemove,
    // 确认
    handleConfirm,
    // 搜索 / 清空
    handleSearch,
    clear,
  }
}
