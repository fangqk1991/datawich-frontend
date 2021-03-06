import { GeneralDataProtocol } from './GeneralDataProtocol'
import Vue from 'vue'
import {
  AccessLevelDescriptor,
  describeAccessLevelDetail,
  DisplayScopeDescriptor,
  FieldTypeDescriptor,
  ModelTypeDescriptor,
} from '@fangcha/datawich-service/lib/common/models'
import { _DatawichAttachmentOptions, AttachmentOptions } from './plugins/attachment/AttachmentOptions'
import { FieldPluginCenter } from './core'
import { AttachmentFieldPlugin } from './plugins/attachment/AttachmentFieldPlugin'

Vue.filter('describe_model_scope_type', function (val: any) {
  return DisplayScopeDescriptor.describe(val)
})

Vue.filter('describe_model_field_type', function (val: any) {
  return FieldTypeDescriptor.describe(val)
})

Vue.filter('describe_model_type', function (val: any) {
  return ModelTypeDescriptor.describe(val)
})

Vue.filter('describe_model_access_level', function (val: any) {
  return AccessLevelDescriptor.describe(val)
})

Vue.filter('describe_model_access_level_detail', function (val: any) {
  return describeAccessLevelDetail(val)
})
Vue.filter(
  'digitFormat',
  function (n: number | string, digits: number = 2, maximumFractionDigits: number | null = null) {
    if (n === '' || n === null || n === undefined) {
      return ''
    }
    if (maximumFractionDigits === null) {
      maximumFractionDigits = digits
    }
    const config =
      digits === 0 && maximumFractionDigits === 0
        ? {}
        : { maximumFractionDigits: maximumFractionDigits, minimumFractionDigits: digits }
    return Number(n).toLocaleString('en-US', config)
  }
)

class _GeneralDataManager {
  public do!: GeneralDataProtocol

  public setProtocol(protocol: GeneralDataProtocol) {
    this.do = protocol
  }

  public useAttachmentFieldPlugin(options: AttachmentOptions) {
    Object.assign(_DatawichAttachmentOptions, options)
    FieldPluginCenter.addPlugin(new AttachmentFieldPlugin())
    return this
  }
}

export const GeneralDataManager = new _GeneralDataManager()
