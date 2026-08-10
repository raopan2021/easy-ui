import type { App, Plugin } from 'vue'

import { INSTALLED_KEY } from '../constants'

export function makeInstaller(components: Plugin[] = []) {
  const install = (app: App, _options?: Record<string, any>) => {
    if ((app as any)[INSTALLED_KEY]) {
      return
    }

    (app as any)[INSTALLED_KEY] = true
    components.forEach(c => app.use(c))
  }

  return {
    version: '0.0.0-dev',
    install,
  }
}
