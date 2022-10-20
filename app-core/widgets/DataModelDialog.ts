import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import {
  AccessLevel,
  AccessLevelDescriptor,
  DatahubEngineModel,
  DatahubTableModel,
  DataModelModel,
  ModelType,
  ModelTypeDescriptor,
} from '@fangcha/datawich-service/lib/common/models'
import { DatahubApis } from '@fangcha/datawich-service/lib/common/web-api'
import { SelectOption } from '@fangcha/tools'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
  },
  template: `
    <typical-dialog-view ref="my-dialog" :title="title" width="50%" :callback="callback">
    <el-form class="my-mini-form" size="mini" label-width="120px">
      <el-form-item label="模型类型" :required="true">
        <el-radio-group v-model="data.modelType" :disabled="forEditing && isDatahubModel">
          <el-radio-button 
            v-for="item in modelTypeOptions" 
            :key="item.value" 
            :label="item.value"
            :disabled="item.disabled">
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
        <el-tooltip class="item" effect="dark" placement="top">
          <span class="el-icon-question" />
          <div slot="content">
            「内容管理模型」通常由若干「用户」字段和「枚举」字段构成<br />
            常规模型关联后，相关用户可以看到非本人添加的相关常规数据<br />
          </div>
        </el-tooltip>
      </el-form-item>
      <template v-if="isDatahubModel">
        <el-form-item label="链接类型" :required="true">
          <el-select v-model="data.datahubLink.engineKey" style="width: 100%;" :disabled="forEditing"
                     @change="reloadDatahubTables">
            <el-option
              v-for="option in engineOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据源" :required="true">
          <el-select v-model="data.datahubLink.tableKey" style="width: 100%;" :disabled="forEditing">
            <el-option
              v-for="option in tableOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </template>
      <el-form-item label="模型 Key" :required="true">
        <el-input v-model="data.modelKey" type="text" style="width: 160px;" :disabled="forEditing">
        </el-input>
      </el-form-item>
      <el-form-item v-if="false" label="模型标识符">
        <el-input v-model="data.shortKey" type="text" style="width: 160px;">
        </el-input>
      </el-form-item>
      <el-form-item label="模型名称" :required="true">
        <el-input v-model="data.name" type="text" style="width: 160px;"></el-input>
      </el-form-item>
      <el-form-item label="模型描述" :required="false">
        <el-input v-model="data.description" :rows="3" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="备注" :required="false">
        <el-input v-model="data.remarks" type="text" style="width: 160px;"></el-input>
      </el-form-item>
      <el-form-item v-if="$app.isAdministrator()" label="是否可导出" class="admin-only" :required="true">
        <el-radio-group v-model="data.isDataExportable">
          <el-radio-button :key="1" :label="1">Yes</el-radio-button>
          <el-radio-button :key="0" :label="0">No</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否发布" :required="true">
        <el-radio-group v-model="data.isOnline">
          <el-radio-button :key="1" :label="1">已发布</el-radio-button>
          <el-radio-button :key="0" :label="0">未发布</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="可访问性" :required="false">
        <el-radio-group v-model="data.accessLevel">
          <el-radio-button
            v-for="accessLevel in accessLevelList"
            :key="accessLevel"
            :label="accessLevel">
            {{ accessLevel | describe_model_access_level }}
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                {{ accessLevel | describe_model_access_level_detail }}
              </div>
            </el-tooltip>
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否可关联" :required="false">
        <el-radio-group v-model="data.isLibrary">
          <el-radio-button :key="1" :label="1">可关联</el-radio-button>
          <el-radio-button :key="0" :label="0">不可关联</el-radio-button>
        </el-radio-group>
        <el-tooltip class="item" effect="dark" placement="top">
          <span class="el-icon-question" />
          <div slot="content">
            「可关联」意味着该模型的 Unique 字段可被其他模型外键关联
          </div>
        </el-tooltip>
      </el-form-item>
      <el-form-item v-if="false" label="数据分析？" :required="false">
        <el-radio-group v-model="data.star">
          <el-radio-button :key="1" :label="1">是</el-radio-button>
          <el-radio-button :key="0" :label="0">否</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    </typical-dialog-view>
  `,
})
export class DataModelDialog extends TypicalDialog {
  modelTypeOptions: SelectOption[] = []
  accessLevelList = AccessLevelDescriptor.values

  data: DataModelModel | any = {
    modelKey: '',
    shortKey: '',
    modelType: ModelType.NormalModel,
    accessLevel: AccessLevel.Protected,
    name: '',
    description: '',
    remarks: '',
    isOnline: 0,
    isLibrary: 0,
    isDataExportable: 0,
    star: 0,
    datahubLink: {
      engineKey: '',
      tableKey: '',
    },
  }
  forEditing = false

  engineOptions: SelectOption[] = []
  tableOptions: SelectOption[] = []

  constructor() {
    super()
  }

  viewDidLoad() {
    this.reloadDatahubEngines()
    const options = ModelTypeDescriptor.options()
    options.forEach((option) => {
      option['disabled'] =
        option.value === ModelType.ContentModel || (this.forEditing && option.value === ModelType.DatahubModel)
    })
    this.modelTypeOptions = options
  }

  get isNormalModel() {
    return this.data.modelType === ModelType.NormalModel
  }

  get isDatahubModel() {
    return this.data.modelType === ModelType.DatahubModel
  }

  static createModelDialog() {
    const dialog = new DataModelDialog()
    dialog.title = '创建模型'
    return dialog
  }

  static editModelDialog(data: DataModelModel) {
    const dialog = new DataModelDialog()
    dialog.title = '编辑模型'
    dialog.forEditing = true
    dialog.data = Object.assign({}, data)
    return dialog
  }

  onHandleResult() {
    return this.data
  }

  async reloadDatahubTables() {
    if (!this.data.datahubLink.engineKey) {
      return
    }
    const request = MyAxios(new CommonAPI(DatahubApis.DataEngineTableListGet, this.data.datahubLink.engineKey))
    const tables = (await request.quickSend()) as DatahubTableModel[]
    this.tableOptions = tables.map((table) => {
      return {
        label: table.tableKey,
        value: table.tableKey,
      }
    })
    if (tables.length > 0 && !this.data.datahubLink.tableKey) {
      this.data.datahubLink.tableKey = tables[0].tableKey
    }
  }

  async reloadDatahubEngines() {
    const request = MyAxios(DatahubApis.DataEngineListGet)
    const engines = (await request.quickSend()) as DatahubEngineModel[]
    this.engineOptions = engines.map((engine) => {
      return {
        label: engine.name,
        value: engine.engineKey,
      }
    })
    if (engines.length > 0 && !this.data.datahubLink.engineKey) {
      this.data.datahubLink.engineKey = engines[0].engineKey
    }
    this.reloadDatahubTables()
  }
}
