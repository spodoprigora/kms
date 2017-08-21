import Action from '../../action'

export default class SelectOrphan extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectOrphan'
    this._label = 'Orphan'
    this._icon = 'mdi mdi-adjust'
    this.group = 'select'
    this._deny = false
  }

  _execute () {
    const orphans = []
    let items = this.registrar.visibleItems.getAll()
    _.each(items, (item) => {
      if (this.registrar.visibleLinked(item).length === 0) orphans.push(item)
    })
    this.registrar.selection.add(orphans)
  }
}
