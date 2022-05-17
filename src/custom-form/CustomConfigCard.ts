import { Component } from 'vue-property-decorator'
import { Prop, ViewController } from '@fangcha/vue'
import { FieldType, GeneralDataFormatter, ModelFullMetadata } from '@fangcha/datawich-service/lib/common/models'
import { MultiEnumContainer, TagsContainer } from '../data-app'
import { MyAxios } from '@fangcha/vue/basic'
import { SdkDatawichApis2 } from '@fangcha/datawich-service/lib/common/sdk-api'

@Component({
  components: {
    'tags-container': TagsContainer,
    'multi-enum-container': MultiEnumContainer,
  },
  template: `
    <ul class="my-0 pl-3">
      <li v-for="field of describableFields" :key="field.dataKey">
        <b>{{ field.name }}</b> :
        <tags-container
          v-if="field.fieldType === FieldType.Tags"
          :options="field.options"
          :value="configData[field.dataKey]"
        />
        <multi-enum-container
          v-else-if="field.fieldType === FieldType.MultiEnum" 
          :options="field.options"
          :value="configData[field.dataKey]"
        />
        <template v-else-if="field.fieldType === FieldType.Attachment">
          <a v-if="attachmentUrlMap[configData[field.dataKey]]" :href="attachmentUrlMap[configData[field.dataKey]]" target="_blank">点击查看</a>
        </template>
        <b v-else-if="field.fieldType === FieldType.Enum || field.fieldType === FieldType.TextEnum" class="text-danger">
          {{ field.value2LabelMap[configData[field.dataKey]] }}
        </b>
        <b v-else class="text-danger">{{ configData[field.dataKey] }}</b>
      </li>
    </ul>
  `,
})
export class CustomConfigCard extends ViewController {
  FieldType = FieldType

  @Prop({ default: null, type: Object }) readonly metadata!: ModelFullMetadata
  @Prop({ default: null, type: Object }) readonly configData!: any

  constructor() {
    super()
  }

  attachmentUrlMap: { [p: string]: string } = {}

  // attachmentEntity(data: any) {
  //   return data[attachmentEntityKey(this.field)] as OssFileInfo
  // }

  get describableFields() {
    return GeneralDataFormatter.makeDescribableFieldsFromMetadata(this.metadata)
  }

  async viewDidLoad() {
    const attachmentFields = this.describableFields.filter((item) => item.fieldType === FieldType.Attachment)
    if (attachmentFields.length > 0) {
      const request = MyAxios(SdkDatawichApis2.OssUrlsSignature)
      request.setBodyData({
        ossKeys: attachmentFields.map((field) => this.configData[field.dataKey]),
      })
      this.attachmentUrlMap = await request.quickSend()
    }
  }
}
