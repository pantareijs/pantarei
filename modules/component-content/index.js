'use strict'

export default superclass => class extends superclass {

  async init () {
    super.init()
    await this.locks.unlocked(['styles', 'template'])
    let html_content = this.html_styles + this.html_template
    this.shadowRoot.innerHTML = html_content
    this.locks.unlock('content')
  }

}