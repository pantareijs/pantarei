'use strict'

import Path from '../path/index.js'

export default superclass => class extends superclass {

  static template_url = 'template.html'

  static get_template () {
    if (!this.promise_template) {
      this.promise_template = this.prepare_template()
    }
    return this.promise_template
  }

  static async prepare_template () {
    let template_text = this.template_text
    if (template_text) {
      return template_text
    }

    let template_url = this.template_url
    if (!template_url) {
      return ''
    }
    let base_url = this.base_url
    base_url = base_url.replace('/index.js', '/')
    template_url = Path.join(base_url, template_url)

    template_text = await this.fetch_template(template_url)
    return template_text
  }

  static async fetch_template (template_url) {
    try {
      let res = await fetch(template_url)
      let template_text = await res.text()
      return template_text
    } catch (err) {
      console.warn(err)
      return ''
    }
  }

  async init () {
    if (super.init) {
      super.init()
    }
    await this.locks.unlocked('connected')
    this.html_template = await this.constructor.get_template()
    this.locks.unlock('template')
  }

}