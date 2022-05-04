import { ModelFieldModel } from '@fangcha/datawich-service/lib/common/models'

export interface DataDialogProtocol {
  title: string
  setFieldsAndData: (modelKey: string, allFields: ModelFieldModel[], data?: {}) => void
  show: (callback: (result: any) => Promise<void>) => void
  dismiss: () => void
}
