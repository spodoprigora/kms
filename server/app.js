/**
 * Server Application
 * perform complex actions delegated from client application
 */

import _ from 'lodash'
import Util from '../core/util'
import Raw from '../provider/raw/index'
import APIServer from '../provider/api.server/index'

export default class Self {
  constructor (p) {
    this.rootKey = '00000000-0000-4000-8000-000000000000'
    this._itemtypes = ['tag', 'note']
    this._serviceItems = ['root', 'visibleItem', 'itemtype']
    this.serviceItem = {}
    this.p = p


    this.provider = Raw
    this.provider.read(this.p.repository.path)
      .then((graph) => {
        this.graph = graph
        console.info(`Serving items total: ${graph.getItemKeys().length} from ${this.p.source}`)
        this.apiServer = new APIServer({
          source: this.p.repository.path,
          target: this.p.repository.path,
          graph: this.graph,
          provider: this.provider,
        })
        this._initServiceItems()
      })
  }

  _initServiceItems () {
    _.each(this._serviceItems.concat(this._itemtypes), (item) => {
      this.serviceItem[item] = this.graph.search(this.rootKey, item)[0]
    })
    this.serviceItem.root = this.rootKey
  }
  /**
   * Find Items by value from root
   * @param p
   */
  findNodesByTags (p) {
    return new Promise((resolve, reject) => {
      const args = JSON.parse(p)
      const tagsOr = Util.pluralize(args.tagsOr)
      const serviceKeys = this.graph.find(this.rootKey)
      const itemsMap = {}
      let arrLinkedKeys = []

      if (tagsOr.length > 0) {
        const tags = []
        _.each(tagsOr, (value) => {
          tags.push(this.graph.search(this.serviceItem.tag, value, 'g')[0])
        })
        arrLinkedKeys = _.map(tags, key => this.graph.getLinked(key))
        arrLinkedKeys = _.intersection(...arrLinkedKeys)
      }

      _.pullAll(arrLinkedKeys, serviceKeys)

      _.each(arrLinkedKeys, (key) => {
        itemsMap[key] = this.graph.get(key)
      })

      resolve(itemsMap)
    })
  }

  /**
   * retrieves tags in select2 consumable format by search query
   * @param {String} query
   * @returns {Promise}
   */
  searchTags (query) {
    return new Promise((resolve, reject) => {
      const tagKeys = this.graph.search(this.serviceItem.tag, query, 'g')
      const serviceKeys = _.values(this.serviceItem)
      _.pullAll(tagKeys, serviceKeys)

      const data = _.map(tagKeys, key => ({ id: key, text: this.graph.get(key) }))
      resolve(data)
    })
  }
}
