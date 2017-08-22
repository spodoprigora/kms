import Action from '../../action'

export default class SelectOrphan extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectOrphan'
    this._label = 'Orphan'
    this._icon = 'mdi mdi-adjust'
    this.group = 'select'

    this.registrar.visibleItems.on('change', this.evaluate.bind(this))
  }

  _execute () {
    const orphans = this._getOrphan()
    if (orphans.length > 0) this.registrar.selection.add(orphans)
  }

  _getOrphan () {
    const orphans = []
    let items = this.registrar.visibleItems.getAll()
    _.each(items, (item) => {
      if (this.registrar.visibleLinked(item).length === 0) orphans.push(item)
    })
    return orphans
  }

  evaluate () {
    super._evaluate(this._getOrphan().length > 0)
  }
}
