import Vue from 'vue'
import { ActionEventDescriptor, DatawichSystemInfo, TinyModelInfo } from '@fangcha/datawich-service/lib/common/models'
import { FrontendPluginProtocol, MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { NotificationCenter } from 'notification-center-js'
import { SdkDatawichApis2 } from '@fangcha/datawich-service/lib/common/sdk-api'
import { GeneralDataManager } from './GeneralDataManager'
import { AttachmentOptions } from './plugins/attachment/AttachmentOptions'
import { FieldPluginCenter, FieldPluginProtocol } from './core'

Vue.filter('describe_tiny_model_summary', function (val: TinyModelInfo) {
  return `${val.name} [${val.modelKey}]`
})

Vue.filter('build_model_page_url', function (modelKey: string) {
  return CommonAPI.buildUrl(DatawichFrontendService.systemInfo.modelStructureBaseURL, modelKey)
})

Vue.filter('describe_action_event', function (val: any) {
  return ActionEventDescriptor.describe(val)
})

interface Params {
  default_loadAvailableCustomModels?: () => Promise<TinyModelInfo[]>
  attachmentOptions?: AttachmentOptions
  plugins?: FieldPluginProtocol[]
}

class _DatawichFrontendService implements FrontendPluginProtocol {
  params!: Params

  routes = []

  systemInfo: DatawichSystemInfo = {
    modelStructureBaseURL: '',
  }

  public init(params: Params = {}) {
    if (params.attachmentOptions) {
      GeneralDataManager.useAttachmentFieldPlugin(params.attachmentOptions)
    }
    if (params.plugins) {
      FieldPluginCenter.addPlugin(...params.plugins)
    }
    this.params = params
    return this
  }

  public async reloadSystemInfo() {
    const request = MyAxios(SdkDatawichApis2.SystemInfoGet)
    this.systemInfo = await request.quickSend()
    NotificationCenter.defaultCenter().postNotification('__onDatawichSystemInfoChanged')
  }

  public onAppWillLoad() {
    this.reloadSystemInfo()
  }
}

export const DatawichFrontendService = new _DatawichFrontendService()
