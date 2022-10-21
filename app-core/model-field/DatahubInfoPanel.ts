import { ViewController, Component, Prop, LoadingView } from '@fangcha/vue'
import {
  calculateAvailableFieldTypes,
  DatahubColumnModel,
  DatahubSyncProgressModel,
} from '@fangcha/datawich-service/lib/common/models'
import { DatahubApis, DataModelApis } from '@fangcha/datawich-service/lib/common/web-api'
import { MyTableView, TableViewProtocol } from '@fangcha/vue'
import { SimpleInputDialog } from '@fangcha/vue'
import { ConfirmDialog } from '@fangcha/vue'
import { NotificationCenter } from 'notification-center-js'
import ModelFieldDialog from './ModelFieldDialog'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichEventKeys } from '../../src'

@Component({
  components: {
    'my-table-view': MyTableView,
  },
  template: `
    <my-table-view v-loading="isLoading" ref="tableView" :delegate="delegate" :single-page="true" :sort-in-local="true">
      <div slot="header">
        <h3>数据源信息</h3>
        <ul style="line-height: 2">
          <li>Engine: {{ mainInfo.engineKey }}</li>
          <li>Table: {{ mainInfo.tableKey }}</li>
          <li v-if="mainInfo.latestProgress">
            最新数据: {{ mainInfo.latestProgress.sampleDate }} [ {{ mainInfo.latestProgress.total }} 条 ]
          </li>
          <li>
            数据采样日期: {{ mainInfo.sampleDate }}
            | <small><a href="javascript:" @click="onLoadLatestRecords">载入最新</a></small>
          </li>
          <li>
            (绑定/更改标签字段定义后，请重新采样最新数据)
          </li>
        </ul>
        <hr />
        <h3 class="mt-4">数据源 · 列</h3>
      </div>
      <el-table-column prop="columnKey" label="字段键" min-width="120px" />
      <el-table-column label="字段描述">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
          | <a href="javascript:" @click="onEditItem(scope.row)">编辑</a>
        </template>
      </el-table-column>
      <el-table-column prop="columnType" label="字段类型" />
      <el-table-column label="Nullable">
        <template slot-scope="scope">
          <span>{{ scope.row.nullable ? 'NULL' : 'NOT NULL' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="extrasInfo" label="Extra" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <span v-if="scope.row.linkField">已绑定 {{ scope.row.linkField }}</span>
          <a v-else href="javascript:" @click="onBindItem(scope.row)">绑定到模型</a>
        </template>
      </el-table-column>
    </my-table-view>
  `,
})
export class DatahubInfoPanel extends ViewController {
  @Prop({ default: '', type: String }) readonly modelKey!: string

  get tableView() {
    return this.$refs.tableView as MyTableView
  }
  get delegate(): TableViewProtocol {
    return {
      loadData: async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.ModelDatahubFieldListGet, this.modelKey))
        const items = (await request.quickSend()) as DatahubColumnModel[]
        return {
          totalSize: items.length,
          elements: items,
        }
      },
    }
  }

  mainInfo: {
    engineKey: string
    tableKey: string
    sampleDate: string
    latestProgress?: DatahubSyncProgressModel
  } = {
    engineKey: '',
    tableKey: '',
    sampleDate: '',
    latestProgress: undefined,
  }

  viewDidLoad() {
    NotificationCenter.defaultCenter().addObserver(DatawichEventKeys.kOnModelFieldsUpdated, (modelKey: string) => {
      if (modelKey === this.modelKey) {
        this.reloadData()
      }
    })
    this.loadMainInfo()
    this.reloadData()
  }

  async loadMainInfo() {
    const request = MyAxios(new CommonAPI(DataModelApis.ModelDatahubInfoGet, this.modelKey))
    this.mainInfo = await request.quickSend()
  }

  reloadData() {
    return this.tableView.reloadData()
  }

  async onEditItem(feed: DatahubColumnModel) {
    const dialog = new SimpleInputDialog()
    dialog.placeholder = '添加描述'
    dialog.show(async (name: string) => {
      const request = MyAxios(
        new CommonAPI(DatahubApis.DataColumnInfoUpdate, feed.engineKey, feed.tableKey, feed.columnKey)
      )
      request.setBodyData({
        name: name,
      })
      await request.execute()
      this.$message.success('编辑成功')
      this.reloadData()
    })
  }

  onLoadLatestRecords() {
    const dialog = new ConfirmDialog()
    dialog.title = `请确认`
    dialog.content = `是否载入最新数据？<br /><small style="color: red; font-weight: bold;">本操作为全量替换，如无必要，请勿频繁操作</small>`
    dialog.show(async () => {
      await LoadingView.loadHandler('正在载入数据，请稍等...', async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.ModelDatahubRecordsLoad, this.modelKey))
        await request.execute()
      })
      NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      this.$message.success('载入成功')
    })
  }

  async onBindItem(feed: DatahubColumnModel) {
    const availableTypes = calculateAvailableFieldTypes(feed.columnType)
    if (availableTypes.length === 0) {
      this.$message.error(`暂不支持对 ${feed.columnType} 的绑定`)
      return
    }
    const dialog = ModelFieldDialog.bindFieldDialog(availableTypes)
    dialog.modelKey = this.modelKey
    dialog.show(async (params: any) => {
      await LoadingView.loadHandler('正在绑定及载入数据，请稍等', async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.ModelDatahubColumnBind, this.modelKey))
        request.setBodyData({
          columnKey: feed.columnKey,
          fieldData: params,
        })
        await request.execute()
      })
      NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      this.$message.success('绑定成功')
      this.reloadData()
    })
  }
}
