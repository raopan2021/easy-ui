<script setup lang="ts">
import type { UserPickerEmits, UserPickerProps } from './types'
import { useUserPicker } from './use-user-picker'

// 保持对外类型导出兼容（原定义在 user-picker.vue）
export type { FetchUsersOptions, UserItem, UserPickerEmits, UserPickerProps } from './types'

defineOptions({ name: 'EasyUserPicker' })

const props = withDefaults(defineProps<UserPickerProps>(), {
  modelValue: null,
  multiple: false,
  max: 999,
  disabled: false,
  placeholder: '选择用户',
  showExtra: false,
  valueKey: 'id',
  nameKey: 'name',
  avatarKey: 'avatar',
  extraKey: 'department',
  isDisabled: () => false,
  returnType: 'array',
})

const emit = defineEmits<UserPickerEmits>()

// ──── 核心逻辑（数据加载 / 选择 / 搜索 / 弹窗 / 值回传）────
const {
  visible,
  searchText,
  tempSelected,
  loading,
  valueKey,
  nameKey,
  avatarKey,
  extraKey,
  selectedUsers,
  filteredUsers,
  isSelected,
  isDisabled,
  getInitials,
  handleOpen,
  handleClose,
  handleSelect,
  handleRemove,
  handleConfirm,
  handleSearch,
  clear,
} = useUserPicker(props, emit)

// 暴露方法（通过 ref 调用）
defineExpose({
  open: handleOpen,
  close: handleClose,
  clear,
})
</script>

<template>
  <div class="easy-user-picker">
    <!-- 已选用户显示区 -->
    <div class="easy-user-picker__selected">
      <!-- 禁用状态下的占位 -->
      <div v-if="disabled && selectedUsers.length === 0" class="easy-user-picker__placeholder">
        {{ placeholder }}
      </div>

      <!-- 已选用户标签 -->
      <div v-for="user in selectedUsers" :key="user[valueKey]" class="easy-user-picker__tag">
        <img v-if="user[avatarKey]" :src="user[avatarKey]" class="easy-user-picker__avatar">
        <span v-else class="easy-user-picker__avatar-text">{{ getInitials(user) }}</span>
        <span class="easy-user-picker__name">{{ user[nameKey] }}</span>
        <span v-if="showExtra && user[extraKey]" class="easy-user-picker__extra">{{ user[extraKey] }}</span>
        <span v-if="!disabled" class="easy-user-picker__close" @click.stop="handleRemove(user)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
      </div>

      <!-- 单选模式添加按钮（未禁用时始终显示在右侧） -->
      <div v-if="!disabled && !multiple" class="easy-user-picker__add" @click="handleOpen">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span>{{ selectedUsers.length > 0 ? '切换' : placeholder }}</span>
      </div>

      <!-- 多选模式添加按钮 -->
      <div v-if="!disabled && multiple" class="easy-user-picker__add" @click="handleOpen">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span>{{ placeholder }}</span>
      </div>
    </div>

    <!-- 选择弹窗 -->
    <Teleport to="body">
      <div v-if="visible" class="easy-user-picker__modal" @click.self="handleClose">
        <div class="easy-user-picker__dialog">
          <div class="easy-user-picker__header">
            <h3>选择用户</h3>
            <button class="easy-user-picker__close" @click="handleClose">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- 搜索框 -->
          <div class="easy-user-picker__search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <input v-model="searchText" type="text" placeholder="搜索用户名..." @input="handleSearch">
          </div>

          <!-- 用户列表 -->
          <div class="easy-user-picker__list">
            <div v-if="loading" class="easy-user-picker__loading">
              <svg class="easy-user-picker__spinner" width="24" height="24" viewBox="0 0 24 24">
                <circle
                  cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="60"
                  stroke-dashoffset="20"
                />
              </svg>
              <span>加载中...</span>
            </div>
            <template v-else>
              <div
                v-for="user in filteredUsers"
                :key="user[valueKey]"
                class="easy-user-picker__item"
                :class="{
                  'is-selected': isSelected(user),
                  'is-disabled': isDisabled(user),
                }"
                @click="handleSelect(user)"
              >
                <div class="easy-user-picker__item-check">
                  <svg v-if="isSelected(user)" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7L6 10L11 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <img v-if="user[avatarKey]" :src="user[avatarKey]" class="easy-user-picker__item-avatar">
                <span v-else class="easy-user-picker__item-avatar-text">{{ getInitials(user) }}</span>
                <div class="easy-user-picker__item-info">
                  <span class="easy-user-picker__item-name">{{ user[nameKey] }}</span>
                  <span v-if="showExtra && user[extraKey]" class="easy-user-picker__item-extra">{{
                    user[extraKey]
                  }}</span>
                </div>
              </div>
              <div v-if="!loading && filteredUsers.length === 0" class="easy-user-picker__empty">
                暂无数据
              </div>
            </template>
          </div>

          <!-- 底部操作 -->
          <div class="easy-user-picker__footer">
            <span class="easy-user-picker__tip"> 已选 {{ tempSelected.length }}{{ multiple ? `/${max}` : '' }} 个 </span>
            <div class="easy-user-picker__actions">
              <button class="easy-user-picker__btn easy-user-picker__btn--cancel" @click="handleClose">
                取消
              </button>
              <button class="easy-user-picker__btn easy-user-picker__btn--confirm" @click="handleConfirm">
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.easy-user-picker {
  width: 100%;
}

.easy-user-picker__selected {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  min-height: 42px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color);
  cursor: text;

  &:hover {
    border-color: #4f6ef7;
  }
}

.easy-user-picker__tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px 2px 4px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #e6e8eb;
  }
}

.easy-user-picker__avatar,
.easy-user-picker__avatar-text {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.easy-user-picker__avatar {
  object-fit: cover;
}

.easy-user-picker__avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary);
  color: var(--el-color-white);
  font-size: 10px;
  font-weight: 500;
}

.easy-user-picker__name {
  font-size: 13px;
  color: var(--el-text-color-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.easy-user-picker__extra {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.easy-user-picker__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: var(--el-fill-color);
    color: var(--el-text-color-primary);
  }
}

.easy-user-picker__add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  color: var(--el-color-primary);
  font-size: 13px;
  cursor: pointer;
  border: 1px dashed var(--el-color-primary);
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(79, 110, 247, 0.08);
  }
}

// 禁用状态占位文字
.easy-user-picker__placeholder {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

// 弹窗样式
.easy-user-picker__modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.easy-user-picker__dialog {
  width: 480px;
  max-width: 90vw;
  max-height: 70vh;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.easy-user-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f2f3f7;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.easy-user-picker__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }
}

.easy-user-picker__search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 16px;
  padding: 0 12px;
  height: 40px;
  background: var(--el-fill-color-light);
  border-radius: 8px;

  svg {
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 14px;
    outline: none;

    &::placeholder {
      color: var(--el-text-color-secondary);
    }
  }
}

.easy-user-picker__list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.easy-user-picker__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.easy-user-picker__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.easy-user-picker__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.is-selected {
    background: rgba(79, 110, 247, 0.1);
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  }
}

.easy-user-picker__item-check {
  width: 18px;
  height: 18px;
  border: 2px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;

  .is-selected & {
    background: #4f6ef7;
    border-color: var(--el-color-primary);
    color: var(--el-color-white);
  }
}

.easy-user-picker__item-avatar,
.easy-user-picker__item-avatar-text {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.easy-user-picker__item-avatar {
  object-fit: cover;
}

.easy-user-picker__item-avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f6ef7 0%, #7c8ffa 100%);
  color: var(--el-color-white);
  font-size: 13px;
  font-weight: 500;
}

.easy-user-picker__item-info {
  flex: 1;
  min-width: 0;
}

.easy-user-picker__item-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.easy-user-picker__item-extra {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.easy-user-picker__empty {
  padding: 40px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.easy-user-picker__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #f2f3f7;
  background: var(--el-fill-color-lighter);
}

.easy-user-picker__tip {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.easy-user-picker__actions {
  display: flex;
  gap: 8px;
}

.easy-user-picker__btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.easy-user-picker__btn--cancel {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-regular);

    &:hover {
      background: #e6e8eb;
    }
  }

  &.easy-user-picker__btn--confirm {
    background: #4f6ef7;
    color: var(--el-color-white);

    &:hover {
      background: #3d5ce5;
    }
  }
}
</style>

<style lang="scss">
html.dark .easy-user-picker__selected {
  background: var(--el-fill-color);
  border-color: var(--el-border-color);
}
html.dark .easy-user-picker__selected:hover {
  border-color: var(--el-color-primary);
}
html.dark .easy-user-picker__tag {
  background: var(--el-fill-color-lighter);
}
html.dark .easy-user-picker__tag:hover {
  background: var(--el-fill-color);
}
html.dark .easy-user-picker__name {
  color: var(--el-text-color-primary);
}
html.dark .easy-user-picker__extra {
  color: var(--el-text-color-secondary);
}
html.dark .easy-user-picker__dialog {
  background: var(--el-bg-color-overlay);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}
html.dark .easy-user-picker__header {
  border-bottom-color: var(--el-border-color-light);
}
html.dark .easy-user-picker__header h3 {
  color: var(--el-text-color-primary);
}
html.dark .easy-user-picker__search {
  background: var(--el-fill-color-lighter);
}
html.dark .easy-user-picker__item:hover {
  background: var(--el-fill-color-light);
}
html.dark .easy-user-picker__footer {
  border-top-color: var(--el-border-color-light);
  background: var(--el-fill-color-lighter);
}
html.dark .easy-user-picker__item-name {
  color: var(--el-text-color-primary);
}
html.dark .easy-user-picker__item-extra {
  color: var(--el-text-color-secondary);
}
</style>
