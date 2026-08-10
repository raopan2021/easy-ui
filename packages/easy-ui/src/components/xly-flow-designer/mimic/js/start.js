import { BaseNodeModel } from './baseNodeModel'
import { BaseNodeView } from './baseNodeView'

class StartModel extends BaseNodeModel {}

class StartView extends BaseNodeView {}

export default {
  type: 'start',
  model: StartModel,
  view: StartView,
}
