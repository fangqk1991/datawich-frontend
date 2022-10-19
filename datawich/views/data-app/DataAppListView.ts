import { Component, GridView, TableViewProtocol, ViewController } from '@fangcha/vue'
import { DataModelModel } from '@fangcha/datawich-service/lib/common/models'
import { DataAppApis } from '@fangcha/datawich-service/lib/common/web-api'
import { MyAxios } from '@fangcha/vue/basic'
import { getRouterToDataApp } from '../../../src'

@Component({
  components: {
    'grid-view': GridView,
  },
  template: `
    <div>
      <h2>数据应用列表</h2>
      <grid-view ref="tableView" :delegate="delegate" class="mt-4" style="line-height: 3">
        <router-link slot-scope="scope" :to="routeToDataApp(scope.data)" class="mr-2">
          <el-button>{{ scope.data.name }}</el-button>
        </router-link>
      </grid-view>
    </div>
  `,
})
export default class DataAppListView extends ViewController {
  routeToDataApp(model: DataModelModel) {
    return getRouterToDataApp(model)
  }

  async viewDidLoad() {
    this.tableView().resetFilter(true)
  }

  tableView() {
    return this.$refs.tableView as GridView
  }

  get delegate(): TableViewProtocol {
    return {
      loadOnePageItems: async (_retainParams) => {
        const request = MyAxios(DataAppApis.DataAppListGet)
        return request.quickSend()
      },
    }
  }
}
