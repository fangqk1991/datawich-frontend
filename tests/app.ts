import { AdminApp } from '@fangcha/vue/app-admin'
import { I18nCode, VisitorInfo } from '@fangcha/tools'
import '@fangcha/vue/fangcha/fc-styles.scss'

const app = new AdminApp({
  appName: 'Datawich 🍰',
  useRemoteLocale: false,
  sidebarNodes: [
    {
      titleEn: 'Menu 1',
      titleZh: 'Menu 1',
      icon: 'el-icon-user',
      links: [
        {
          titleEn: 'Sub Menu 1',
          titleZh: 'Sub Menu 1',
          path: '/v1/page-1',
        },
      ],
    },
  ],
  routes: [
    // {
    //   path: '/v1/page-red',
    //   require: 'Red',
    //   component: Red_View,
    // },
  ],
  reloadUserInfo: async (): Promise<VisitorInfo> => {
    return {
      iamId: 0,
      email: 'xxx@email.com',
      name: 'Fangcha',
      permissionKeyMap: {
        Red: 1,
      },
      isAdmin: true,
      locale: I18nCode.en,
    }
  },
})
app.launch()
