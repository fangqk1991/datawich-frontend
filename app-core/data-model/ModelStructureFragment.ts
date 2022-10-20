import { ModelType } from '@fangcha/datawich-service/lib/common/models'
import { Component } from '@fangcha/vue'
import { ModelFieldTable } from '../model-field/ModelFieldTable'
import { DatahubInfoPanel } from '../model-field/DatahubInfoPanel'
import { FieldLinkTable } from '../model-field/FieldLinkTable'
import { FieldGroupTable } from '../model-field/FieldGroupTable'
import { ModelMilestonePanel } from './ModelMilestonePanel'
import { ModelFragmentBase } from './ModelFragmentBase'

@Component({
  components: {
    'model-field-table': ModelFieldTable,
    'field-link-table': FieldLinkTable,
    'field-group-table': FieldGroupTable,
    'datahub-info-panel': DatahubInfoPanel,
    'model-milestone-panel': ModelMilestonePanel,
  },
  template: `
    <div v-if="dataModel">
      <el-card shadow="never">
        <model-milestone-panel :data-model="dataModel" />
      </el-card>
      <el-card class="mt-4" shadow="never">
        <model-field-table @loadWidgetsInfo="onLoadWidgetsInfo" ref="fieldTableView" :model-key="modelKey" :simple-mode="isDatahubModel" />
      </el-card>
      <el-card class="mt-4" shadow="never">
        <field-group-table ref="fieldGroupTableView" :model-key="modelKey" />
      </el-card>
      <el-card class="mt-4" shadow="never">
        <field-link-table ref="linkTableView" :model-key="modelKey" />
      </el-card>
      <el-card v-if="isDatahubModel" class="mt-4" shadow="never">
        <datahub-info-panel :model-key="modelKey" />
      </el-card>
    </div>
  `,
})
export class ModelStructureFragment extends ModelFragmentBase {
  get isDatahubModel() {
    return this.dataModel && this.dataModel.modelType === ModelType.DatahubModel
  }

  async onLoadWidgetsInfo() {
    this.$nextTick(() => {
      {
        const tableView = this.$refs.fieldTableView as ModelFieldTable
        tableView.reloadData()
      }
      {
        const tableView = this.$refs.linkTableView as FieldLinkTable
        tableView.reloadData()
      }
      {
        const tableView = this.$refs.fieldGroupTableView as FieldGroupTable
        tableView.reloadData()
      }
    })
  }
}
