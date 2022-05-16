import { Component } from 'vue-property-decorator'
import { Prop, ViewController } from '@fangcha/vue'
import { FieldType, GeneralDataFormatter, ModelFullMetadata } from '@fangcha/datawich-service/lib/common/models'
import { TagsContainer } from '../data-app'

@Component({
  components: {
    'tags-container': TagsContainer,
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

  get describableFields() {
    return GeneralDataFormatter.makeDescribableFieldsFromMetadata(this.metadata)
  }
}
