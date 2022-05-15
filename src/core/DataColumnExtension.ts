import { Component, InfoCell, InformationDialog, Prop, ViewController } from '@fangcha/vue'
import {
  ActionEvent,
  calculateDataKey,
  FieldActionModel,
  FieldLinkModel,
  ModelFieldModel,
} from '@fangcha/datawich-service/lib/common/models'
import { TemplateHelper } from '@fangcha/tools'

@Component({
  template: `
    <span>
      <template v-if="!Boolean(superField)">
        <a v-for="action in linkActions" :key="action.actionId" :href="makeLink(action)" target="_blank">
          <el-tag class="adaptive-tag" type="danger"><i class="el-icon-connection" /> {{ action.title }}</el-tag>
        </a>
        <a v-for="action in modalActions" :key="action.actionId" href="javascript:" @click="showInfo(action)">
          <el-tag class="adaptive-tag" type="danger"><i class="el-icon-info" /> {{ action.title }}</el-tag>
        </a>
      </template>
      <template v-if="data[field.dataKey]">
      <a v-for="link in outerLinks" :key="link.linkId" href="javascript:" @click="showReferenceInfos(link)">
        <el-tag class="adaptive-tag" type="danger"><i class="el-icon-info" /> 外联 {{ link.refModel }}</el-tag>
      </a>
      </template>
    </span>
  `,
})
export class DataColumnExtension extends ViewController {
  @Prop({ default: null, type: Object }) readonly field!: ModelFieldModel
  @Prop({ default: null, type: Object }) readonly data!: any
  @Prop({ default: null, type: Object }) readonly superField!: ModelFieldModel | null

  linkActions: FieldActionModel[] = []
  modalActions: FieldActionModel[] = []
  outerLinks: FieldLinkModel[] = []

  viewDidLoad() {
    const actions = this.field.actions as FieldActionModel[]
    this.linkActions = actions.filter((action) => action.event === ActionEvent.Link)
    this.modalActions = actions.filter((action) => action.event === ActionEvent.DerivativeInfo)
    const refFieldLinks = this.field.refFieldLinks || []
    this.outerLinks = refFieldLinks.filter((link) => !link.isInline)
  }

  makeLink(action: FieldActionModel) {
    return TemplateHelper.renderTmpl(action.content, this.data)
  }

  async showInfo(action: FieldActionModel) {
    import('../GeneralDataManager').then(async ({ GeneralDataManager }) => {
      const { modelName, infos } = await GeneralDataManager.do.showDataAppRecordActionPerformerInfo(
        this.data.data_id,
        this.field,
        action
      )
      InformationDialog.show(`关联信息 -> ${modelName}`, infos)
    })
  }

  async showReferenceInfos(link: FieldLinkModel) {
    const infos: InfoCell[] = link.referenceFields.map((field) => {
      const dataKey = calculateDataKey(field, this.field)
      return {
        label: field.name,
        value: this.data[dataKey],
      }
    })
    InformationDialog.show(`${this.field.name} 关联信息 -> ${link.refModel}`, infos)
  }
}
