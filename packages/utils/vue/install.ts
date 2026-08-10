import type { App } from 'vue'

import type { SFCInstallWithContext, SFCWithInstall } from './typescript'
import { NOOP } from '../browser'

export function withInstall<T, E extends Record<string, any>>(main: T, extra?: E) {
  (main as SFCWithInstall<T>).install = (app: App): void => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app.component((comp as any).name, comp)
    }
  }

  if (extra) {
    for (const [key, comp] of Object.entries(extra)) {
      (main as any)[key] = comp
    }
  }
  return main as SFCWithInstall<T> & E
}

export function withInstallFunction<T>(fn: T, name: string) {
  (fn as SFCWithInstall<T>).install = (app: App) => {
    (fn as SFCInstallWithContext<T>)._context = app._context
    app.config.globalProperties[name] = fn
  }

  return fn as SFCInstallWithContext<T>
}

export function withNoopInstall<T>(component: T) {
  (component as SFCWithInstall<T>).install = NOOP

  return component as SFCWithInstall<T>
}
