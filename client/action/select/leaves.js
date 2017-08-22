import Action from '../../action'

export default class SelectLeaves extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectLeaves'
    this._label = 'Leaves'
    this._icon = 'mdi mdi-leaf'
    this.group = 'select'

    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    const leaves = this._getLeaves()
    this.registrar.selection.clear()
    this.registrar.selection.add(leaves)
  }

  _getLeaves () {
    const leaves = []
    const selected = this.registrar.selection.getAll()[0]
    const children = this.registrar.visibleLinked(selected)
    _.each(children, (child) => {
      const subchildren = this.registrar.visibleLinked(child)
      if (_.without(subchildren, selected).length === 0) leaves.push(child)
    })
    return leaves
  }

  evaluate (selection) {
    if (selection.getCount() === 1) {
      super._evaluate(this._getLeaves().length > 0)
    }
  }
}
