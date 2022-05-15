import { Component } from '@fangcha/vue'
import { attachmentEntityKey } from '@fangcha/datawich-service/lib/common/models'
import { OssFileInfo } from '@fangcha/oss-service/lib/common/models'
import { DataColumnBase, DataColumnExtension } from '../../core'

@Component({
  components: {
    'data-column-extension': DataColumnExtension,
  },
  template: `
    <el-table-column :label="field.name">
      <template slot-scope="scope">
        <a
          v-if="attachmentEntity(scope.row)"
          :href="attachmentEntity(scope.row).url"
          target="_blank"
        >
          点击查看
        </a>
        <data-column-extension :super-field="superField" :field="field" :data="scope.row" />
      </template>
    </el-table-column>
  `,
})
export class AttachmentDataColumn extends DataColumnBase {
  attachmentEntity(data: any) {
    return data[attachmentEntityKey(this.field)] as OssFileInfo
  }
}
