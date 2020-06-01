'use strict'

import Lock from '../lock/index.js'

export default superclass => class extends superclass {

  async init () {
    if (super.init) {
      super.init()
    }
    this.lock_content = new Lock()
    await Promise.allSettled([
      this.lock_styles.unlocked,
      this.lock_template.unlocked
    ])
    await this.init_content()
  }

  async init_content () {
    let html_styles = this.html_styles
    let html_template = this.html_template
    let html_content = html_styles + html_template
    this.shadowRoot.innerHTML = html_content
    this.lock_content.unlock()
  }

}