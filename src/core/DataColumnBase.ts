import { Component, Prop, ViewController } from '@fangcha/vue'
import { calculateDataKey, ModelFieldModel } from '@fangcha/datawich-service/lib/common/models'

@Component
export class DataColumnBase extends ViewController {
  @Prop({ default: undefined, type: Object }) readonly superField!: ModelFieldModel | undefined
  @Prop({ default: null, type: Object }) readonly field!: ModelFieldModel

  get dataKey() {
    return calculateDataKey(this.field, this.superField)
  }
}
