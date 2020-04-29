'use strict'

import Component from './component.js'

export default class Container extends Component {

  get container () {
    return this
  }

  attach (page) {
    if (this.page === page) {
      return
    }
    this.container.appendChild(page)
    this.page = page

    requestAnimationFrame(this.scroll)
  }

  clear () {
    let container = this.container
    let child
    while (child = container.firstChild) {
      child.remove()
    }
  }

  scroll () {
    document.body.scrollTo(0, 0)
    window.scrollTo(0, 0)
  }

}