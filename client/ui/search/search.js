/**
 * Search widget with autocomplete
 */
import EventEmitter from 'eventemitter3'
import Util from '../../../core/util'
import template from './search.html'
import './search.scss'

export default class Search extends EventEmitter {
  constructor (p = {}) {
    super()
    this.p = p
    const $html = $(template())
    this.p.container.append($html)
    this.elements = Util.findElements($html, this.selectors)

    this.elements.select2Or.select2({
      minimumInputLength: 2,
      ajax: {
        url: '/tags',
        dataType: 'json',
        delay: 250,
        processResults: data => ({ results: data }),
        cache: true,
      },
      tags: true,
      tokenSeparators: [',', ' '],
      placeholder: 'Add your tags here (OR)',
    })
    this.elements.button.on('click', this._onSearch.bind(this))
  }

  get selectors () {
    return {
      select2Or: '#tagsOr',
      button: '.button',
    }
  }

  _onSearch (e) {
    const tagValuesOr = _.map(this.elements.select2Or.select2('data'), obj => obj.text)

    this.trigger('search', {
      tagsOr: tagValuesOr,
    })
  }
}

