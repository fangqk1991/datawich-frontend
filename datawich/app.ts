import { AdminApp } from '@fangcha/vue/app-admin'
import { I18nCode, VisitorInfo } from '@fangcha/tools'
import '@fangcha/vue/fangcha/fc-styles.scss'
import DataAppListView from './views/data-app/DataAppListView'
import DataDisplayView from './views/data-app/DataDisplayView'
import { LogicExpressionView } from './views/components/LogicExpressionView'
import { MyAxios } from '@fangcha/vue/basic'
import { KitProfileApis } from '@fangcha/backend-kit/lib/apis'
import { MyFavorSidebar } from '../src'

const app = new AdminApp({
  appName: 'Datawich 🍰',
  useRemoteLocale: false,
  sidebarNodes: [
    {
      uid: 'data-apps',
      titleEn: '数据应用',
      titleZh: '数据应用',
      icon: 'el-icon-data-analysis',
      links: [
        {
          titleEn: '所有应用',
          titleZh: '所有应用',
          path: '/v2/data-app',
        },
      ],
    },
    {
      titleEn: '模型管理',
      titleZh: '模型管理',
      icon: 'el-icon-lock',
      links: [
        {
          titleEn: '模型管理',
          titleZh: '模型管理',
          path: '/v2/data-model',
        },
      ],
    },
    {
      titleEn: '相关组件',
      titleZh: '相关组件',
      icon: 'el-icon-lock',
      links: [
        {
          titleEn: '逻辑表达式',
          titleZh: '逻辑表达式',
          path: '/v0/component/logic-expression',
        },
      ],
    },
  ],
  routes: [
    {
      path: '/v2/data-app',
      component: DataAppListView,
      name: 'DataAppListView',
    },
    {
      path: '/v2/data-app/:modelKey',
      component: DataDisplayView,
      name: 'DataDisplayView',
      props: true,
    },
    {
      path: '/v0/component/logic-expression',
      component: LogicExpressionView,
      name: 'LogicExpressionView',
    },
  ],
  appDidLoad: async () => {
    MyFavorSidebar.reloadFavorApps()
  },
  reloadUserInfo: async (): Promise<VisitorInfo> => {
    const request = MyAxios(KitProfileApis.BasicProfileGet)
    const response = await request.quickSend<{ email: string }>()
    return {
      iamId: 0,
      email: response.email,
      name: response.email,
      permissionKeyMap: {},
      isAdmin: true,
      locale: I18nCode.en,
    }
  },
})
window._datawichApp = app
app.launch()
