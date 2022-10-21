import {
  ClientAuthModel,
  ClientAuthParams,
  DataModelModel,
  ModelClientModel,
} from '@fangcha/datawich-service/lib/common/models'
import {
  Component,
  ConfirmDialog,
  FragmentProtocol,
  MultiplePickerDialog,
  MySelect,
  MyTableView,
  TableViewProtocol,
  ViewController,
} from '@fangcha/vue'
import { MessageBox } from 'element-ui'
import { DataAppApis, ModelClientApis } from '@fangcha/datawich-service/lib/common/web-api'
import { CheckOption } from '@fangcha/tools'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { ModelClientDialog } from './ModelClientDialog'

@Component({
  components: {
    'my-select': MySelect,
    'my-table-view': MyTableView,
  },
  template: `
    <div v-loading="isLoading">
      <h2>API 应用管理</h2>
      <el-form class="mt-3" :inline="true" size="mini" label-position="top" @submit.native.prevent="onFilterUpdate">
        <el-form-item>
          <el-input
            v-model="filterParams.keywords"
            clearable
            placeholder="关键字"
            style="width: 300px"
            @keyup.enter.native="onFilterUpdate"
          >
            <template slot="append">
              <el-button size="mini" @click="onFilterUpdate">搜索</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <div class="mb-3">
        <el-button type="primary" size="mini" @click="onClickCreate">创建应用</el-button>
      </div>
      <my-table-view ref="tableView" :delegate="delegate">
        <el-table-column prop="appid" label="应用 ID" />
        <el-table-column prop="name" label="应用名称" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <a href="javascript:" @click="onEditItem(scope.row)">修改</a>
            |
            <a href="javascript:" @click="onEditItemAuth(scope.row)">授权模型</a>
            |
            <a href="javascript:" @click="onDeleteItem(scope.row)">删除</a>
          </template>
        </el-table-column>
      </my-table-view>
    </div>
  `,
})
export class ModelClientListView extends ViewController implements FragmentProtocol {
  modelList: DataModelModel[] = []

  filterParams = this.initFilterParams(true)
  initFilterParams(useQuery = false) {
    const query = useQuery ? this.$route.query : {}
    return {
      keywords: query.keywords || '',
    }
  }

  get tableView() {
    return this.$refs.tableView as MyTableView
  }
  get delegate(): TableViewProtocol {
    return {
      loadData: async (retainParams) => {
        const params = {
          ...retainParams,
          ...this.filterParams,
        }
        const request = MyAxios(ModelClientApis.ModelClientListGet)
        request.setQueryParams(params)
        return request.quickSend()
      },
      reactiveQueryParams: (retainQueryParams) => {
        return retainQueryParams
      },
    }
  }

  async reloadModelList() {
    const request = MyAxios(DataAppApis.DataAppListGet)
    request.setQueryParams({ isOnline: '' })
    this.modelList = await request.quickSend()
  }

  viewDidLoad() {
    this.reloadModelList()
    this.tableView.resetFilter(true)
  }

  onEditItem(feed: ModelClientModel) {
    const dialog = ModelClientDialog.editAppDialog(feed)
    dialog.show(async (params: any) => {
      const request = MyAxios(new CommonAPI(ModelClientApis.ModelClientUpdate, feed.appid))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('更新成功')
      this.tableView.reloadData()
    })
  }

  onDeleteItem(feed: ModelClientModel) {
    const dialog = new ConfirmDialog()
    dialog.title = '删除应用'
    dialog.content = `确定要删除 "${feed.name}" 吗？`
    dialog.show(async () => {
      const request = MyAxios(new CommonAPI(ModelClientApis.ModelClientDelete, feed.appid))
      await request.execute()
      this.$message.success('删除成功')
      this.tableView.reloadData()
    })
  }

  async onEditItemAuth(feed: ModelClientModel) {
    const request = MyAxios(new CommonAPI(ModelClientApis.ClientAuthModelListGet, feed.appid))
    const authItems = (await request.quickSend()) as ClientAuthModel[]
    const authData = authItems.reduce((result, cur) => {
      result[cur.modelKey] = true
      return result
    }, {})

    const options: CheckOption[] = this.modelList.map((model) => {
      return {
        label: `${model.name}[${model.modelKey}]`,
        value: model.modelKey,
        checked: !!authData[model.modelKey],
      }
    })
    const dialog = MultiplePickerDialog.dialogWithOptions(options)
    dialog.title = `管理授权模型`
    dialog.show(async (_checkedModelKeys: string[]) => {
      const checkedMap = dialog.checkedMap
      const paramsList: ClientAuthParams[] = []
      for (const model of this.modelList) {
        if (
          (checkedMap[model.modelKey] && !authData[model.modelKey]) ||
          (!checkedMap[model.modelKey] && authData[model.modelKey])
        ) {
          paramsList.push({
            appid: feed.appid,
            modelKey: model.modelKey,
            checked: checkedMap[model.modelKey],
          })
        }
      }
      const request = MyAxios(new CommonAPI(ModelClientApis.ClientAuthModelListUpdate, feed.appid))
      request.setBodyData(paramsList)
      await request.execute()
      this.$message.success('调整成功')
    })
  }

  onClickCreate() {
    const dialog = ModelClientDialog.createAppDialog()
    dialog.show(async (params: any) => {
      const request = MyAxios(ModelClientApis.ModelClientCreate)
      request.setBodyData(params)
      const data = (await request.quickSend()) as ModelClientModel
      const tableView = this.$refs.tableView as MyTableView
      tableView.reloadData()
      MessageBox.alert(`请保存此 App Secret [${data.appSecret}]（只在本次展示）`, '创建成功', {
        confirmButtonText: '关闭',
        showClose: false,
      })
    })
  }

  onFilterUpdate() {
    this.tableView.onFilterUpdate()
  }

  resetFilter(useQuery: boolean = false) {
    this.tableView.resetFilter(useQuery)
  }
}