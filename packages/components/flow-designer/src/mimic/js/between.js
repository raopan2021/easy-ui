import { BaseNodeModel } from './baseNodeModel'
import { BaseNodeView } from './baseNodeView'

class BetweenModel extends BaseNodeModel {}

class BetweenView extends BaseNodeView {}

export default {
  type: 'between',
  model: BetweenModel,
  view: BetweenView,
}
