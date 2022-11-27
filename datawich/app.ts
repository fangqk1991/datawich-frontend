import { AdminApp } from '@fangcha/vue/app-admin'
import { OssFrontendService } from '@fangcha/vue/oss-service'
import { I18nCode, VisitorInfo } from '@fangcha/tools'
import '@fangcha/vue/fangcha/fc-styles.scss'
import { LogicExpressionView } from './views/components/LogicExpressionView'
import { MyAxios } from '@fangcha/vue/basic'

import { GeneralDataManager } from '../src'
import { RetainedSessionApis } from '@fangcha/backend-kit/lib/common/apis'

OssFrontendService.init({
  defaultBucketName: 'fc-web-oss',
  defaultOssZone: 'datawich',
})

const app = new AdminApp({
  appName: 'Datawich 🍰',
  useRemoteLocale: false,
  plugins: [OssFrontendService],
  style: {
    appHeader: {
      background: '#DD73A4',
    },
  },
  appWillLoad: () => {
    GeneralDataManager.useAttachmentFieldPlugin({
      bucketName: 'fc-web-oss',
      ossZone: 'datawich',
    })
  },
  reloadUserInfo: async (): Promise<VisitorInfo> => {
    const request = MyAxios(RetainedSessionApis.UserInfoGet)
    const response = await request.quickSend<{ email: string }>()
    return {
      iamId: 0,
      email: response.email,
      name: response.email.split('@')[0],
      permissionKeyMap: {},
      isAdmin: true,
      locale: I18nCode.en,
    }
  },
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
        {
          titleEn: 'API 应用管理',
          titleZh: 'API 应用管理',
          path: '/v1/model-client',
        },
      ],
    },
    // {
    //   titleEn: '相关组件',
    //   titleZh: '相关组件',
    //   icon: 'el-icon-lock',
    //   links: [
    //     {
    //       titleEn: '逻辑表达式',
    //       titleZh: '逻辑表达式',
    //       path: '/v0/component/logic-expression',
    //     },
    //   ],
    // },
  ],
  routes: [
    {
      path: '/v0/component/logic-expression',
      component: LogicExpressionView,
      name: 'LogicExpressionView',
    },
  ],
})
window._datawichApp = app
app.launch()
