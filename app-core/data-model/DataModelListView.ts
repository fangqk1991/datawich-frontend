import {
  Component,
  ConfirmDialog,
  FragmentProtocol,
  JsonImportDialog,
  LoadingView,
  MyTableView,
  TableViewProtocol,
  ViewController,
} from '@fangcha/vue'
import { DataModelModel, ModelFullMetadata, ModelType } from '@fangcha/datawich-service/lib/common/models'
import { DataAppApis, DataModelApis } from '@fangcha/datawich-service/lib/common/web-api'
import { SelectOption } from '@fangcha/tools'
import { AppTask, AppTaskQueue } from 'fc-queue'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { getRouterToDataApp } from '../../src'
import { DataModelDialog } from '../widgets/DataModelDialog'

@Component({
  components: {
    'my-table-view': MyTableView,
  },
  template: `
    <div>
      <h2>模型列表</h2>
      <el-form class="mb-2" :inline="true" size="mini" label-position="top" @submit.native.prevent>
        <el-form-item label="快速检索">
          <common-picker
            v-model="filterParams.modelKey"
            filterable
            :options="this.modelOptions"
            style="width: 320px;"
            @change="onFilterUpdate"
          />
        </el-form-item>
        <el-form-item :label="$whitespace">
          <el-button type="primary" size="mini" @click="onClickCreate">创建模型</el-button>
        </el-form-item>
        <el-form-item :label="$whitespace">
          <el-button type="success" size="mini" @click="onImportModel">导入模型</el-button>
        </el-form-item>
      </el-form>
      <my-table-view ref="tableView" :delegate="delegate">
        <div slot="header" class="mb-3">
          共 {{ getTotalCount() }} 个模型
        </div>
        <el-table-column prop="modelKey" label="模型 Key" />
        <el-table-column prop="name" label="模型名称">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
            <el-tooltip v-if="scope.row.star" class="item" effect="dark" placement="bottom">
              <span class="el-icon-star-on theme-color" />
              <div slot="content">
                该模型被用于数据分析
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="isOnline" label="发布状态">
          <template slot-scope="scope">
            <span v-if="scope.row.isOnline" style="color: #67C23A">已发布 <i class="el-icon-success"/></span>
            <span v-if="!scope.row.isOnline" style="color: #F56C6C">未发布 <i class="el-icon-error"/></span>
          </template>
        </el-table-column>
        <el-table-column label="特殊属性">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.modelType === ModelType.ContentModel" size="mini">内容管理</el-tag>
            <el-tag v-if="scope.row.modelType === ModelType.DatahubModel" size="mini">外部数据源</el-tag>
            <el-tag v-if="scope.row.isRetained" size="mini" type="danger">系统保留</el-tag>
            <el-tag v-if="scope.row.isLibrary" size="mini">可关联</el-tag>
            <el-tag v-for="name in scope.row.tagList" size="mini" type="danger">
              {{ name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="维护者" />
        <el-table-column label="记录数">
          <template slot-scope="scope">
            <template v-if="countData[scope.row.modelKey] === null">
              加载中……
            </template>
            <template v-else-if="countData[scope.row.modelKey] !== undefined">
              {{ countData[scope.row.modelKey] }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <router-link :to="{ name: 'DataModelManageView', params: { modelKey: scope.row.modelKey } }">
              模型设置
            </router-link>
            |
            <router-link :to="routeToDataApp(scope.row)">
              查看应用
            </router-link>
            |
            <a href="javascript:" @click="onDeleteItem(scope.row)">删除</a>
          </template>
        </el-table-column>
      </my-table-view>
    </div>
  `,
})
export class DataModelListView extends ViewController implements FragmentProtocol {
  ModelType = ModelType
  countData: { [modelKey: string]: number } = {}
  currentItems: DataModelModel[] = []

  initFilterParams(useQuery = false) {
    const query = useQuery ? this.$route.query : {}
    return {
      modelKey: query.modelKey || '',
      isRetained: query.isRetained || '',
      modelType: query.modelType || '',
    }
  }
  filterParams = this.initFilterParams(true)

  tableView() {
    return this.$refs.tableView as MyTableView
  }
  get delegate(): TableViewProtocol {
    return {
      defaultSettings: {
        sortKey: 'createTime',
        pageSize: 20,
      },
      loadData: async (retainParams) => {
        const params = {
          ...retainParams,
          ...this.filterParams,
        }
        const request = MyAxios(DataModelApis.DataModelListGet)
        request.setQueryParams(params)
        const pageData = (await request.quickSend()) as any
        this.currentItems = pageData.elements
        this.reloadModelRecordCounts()
        return pageData
      },
    }
  }

  getTotalCount() {
    if (this.tableView()) {
      return this.tableView().pageInfo.total
    }
    return 0
  }

  viewDidLoad() {
    this.reloadData()
  }

  onFilterUpdate() {
    this.tableView().reloadData()
  }

  reloadData() {
    this.tableView().reloadData()
    this.loadAllModels()
  }

  modelOptions: SelectOption[] = []
  async loadAllModels() {
    const request = MyAxios(DataAppApis.DataAppListGet)
    const modelList = (await request.quickSend()) as DataModelModel[]
    this.modelOptions = modelList.map((item) => {
      return {
        label: `${item.name}(${item.modelKey})`,
        value: item.modelKey,
      }
    })
  }

  onDeleteItem(feed: DataModelModel) {
    const dialog = new ConfirmDialog()
    dialog.title = '删除模型'
    dialog.content = `确定要删除 "${feed.name}" 吗？`
    dialog.show(async () => {
      await this.execHandler(async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.DataModelDelete, feed.modelKey))
        await request.execute()
        this.reloadData()
      })
    })
  }

  routeToDataApp(dataModel: DataModelModel) {
    return getRouterToDataApp(dataModel)
  }

  onClickCreate() {
    const dialog = DataModelDialog.createModelDialog()
    dialog.show(async (params: DataModelModel) => {
      const request = MyAxios(DataModelApis.DataModelCreate)
      request.setBodyData(params)
      const dataModel = (await request.quickSend()) as DataModelModel
      this.$message.success('创建成功')
      this.onModelCreated(dataModel)
    })
  }

  onImportModel() {
    const dialog = JsonImportDialog.dialog()
    dialog.show(async (metadata: ModelFullMetadata) => {
      const request = MyAxios(DataModelApis.DataModelImport)
      request.setBodyData(metadata)
      const dataModel = (await request.quickSend()) as DataModelModel
      this.$message.success('导入成功')
      this.onModelCreated(dataModel)
    })
  }

  public async onModelCreated(dataModel: DataModelModel) {
    this.reloadData()
    if (dataModel.modelType === ModelType.DatahubModel) {
      await LoadingView.loadHandler('正在载入数据，请稍等...', async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.ModelDatahubRecordsLoad, dataModel.modelKey))
        await request.execute()
      })
      this.$message.success('载入成功，您可以进入模型设置中自行绑定所需字段')
    }
  }

  resetFilter(useQuery: boolean = false) {
    this.tableView().resetFilter(useQuery)
  }

  async reloadModelRecordCounts() {
    const todoModels = this.currentItems.filter((item) => !(item.modelKey in this.countData))
    const taskQueue = new AppTaskQueue()
    taskQueue.setMaxConcurrent(10)
    taskQueue.setPendingLimit(-1)

    for (const dataModel of todoModels) {
      taskQueue.addTask(
        new AppTask(async () => {
          this.$set(this.countData, dataModel.modelKey, null)
          const request = MyAxios(new CommonAPI(DataModelApis.DataModelSummaryInfoGet, dataModel.modelKey), {
            mute: true,
          })
          await request.quickSend().then(({ count }) => {
            this.$set(this.countData, dataModel.modelKey, count)
          })
        })
      )
    }

    taskQueue.resume()
  }
}
