import { Component } from 'vue-property-decorator'
import { OssUploadDialog } from '@fangcha/vue/oss-service/index'
import { OssFileInfo, OSSResourceModel } from '@fangcha/oss-service/lib/common/models'
import { FieldFormItemBase } from '../../core'
import { _DatawichAttachmentOptions } from './AttachmentOptions'
import { GeneralDataHelper } from '@fangcha/datawich-service/lib/common/tools'

@Component({
  template: `
    <div>
      <template v-if="attachmentEntity">
        已上传 |
        <a :href="attachmentEntity.url" target="_blank">点击查看</a>
        <template v-if="checkFieldEditable">
          | <a href="javascript:" @click="uploadAttachment">更新</a> |
          <a class="text-danger" href="javascript:" @click="removeAttachment">移除</a>
        </template>
      </template>
      <template v-else>
        <a v-if="checkFieldEditable" href="javascript:" @click="uploadAttachment">上传</a>
      </template>
    </div>
  `,
})
export class AttachmentFormItem extends FieldFormItemBase {
  // TODO: Fill url
  get attachmentEntity() {
    return this.myData[GeneralDataHelper.attachmentEntityKey(this.field)] as OssFileInfo
  }

  uploadAttachment() {
    const field = this.field
    const dialog = new OssUploadDialog()
    dialog.bucketName = _DatawichAttachmentOptions.bucketName
    dialog.ossZone = _DatawichAttachmentOptions.ossZone
    dialog.show(async (resource: OSSResourceModel) => {
      const fileInfo: OssFileInfo = {
        ossKey: resource.ossKey,
        mimeType: resource.mimeType,
        size: resource.size,
      }
      this.myData[field.fieldKey] = JSON.stringify(fileInfo)
      this.myData[GeneralDataHelper.attachmentEntityKey(field)] = {
        ...fileInfo,
        url: resource.url,
      }
    })
  }

  removeAttachment() {
    const field = this.field
    this.myData[field.fieldKey] = ''
    this.myData[GeneralDataHelper.attachmentEntityKey(field)] = null
  }
}
