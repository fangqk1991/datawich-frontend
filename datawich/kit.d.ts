import { AdminApp } from '@fangcha/vue/app-admin'

declare module 'vue/types/vue' {
  interface Vue {
    $app: AdminApp
  }
}
