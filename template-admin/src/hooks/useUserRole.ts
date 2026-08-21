import { useUserStoreHook } from '@/store/modules/user'

/**
 * 当前用户角色判断 Hook
 *
 * @example
 * ```ts
 * const { isAdmin, isBank, roles } = useUserRole();
 * if (isAdmin.value) { ... }
 * ```
 */
export function useUserRole() {
  const userStore = useUserStoreHook()
  const roles: ComputedRef<string[]> = computed(() => userStore?.roles ?? [])
  const isAdmin: ComputedRef<boolean> = computed(() => roles.value.includes('admin'))
  const isBank: ComputedRef<boolean> = computed(() => roles.value.includes('yh'))

  /** 角色集合是否包含指定 role */
  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  return { roles, isAdmin, isBank, hasRole }
}
