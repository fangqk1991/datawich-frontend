import { AdminApp } from '@fangcha/vue/app-admin'

declare module 'vue/types/vue' {
  interface Vue {
    $whitespace: string
    $router: VueRouter
    $app: AdminApp
  }
}

declare global {
  interface Window {
    _datawichApp: AdminApp
  }
}
