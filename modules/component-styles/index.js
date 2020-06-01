'use strict'

import Lock from '../lock/index.js'
import Path from '../path/index.js'

export default superclass => class extends superclass {

  static style_urls = ['style.css']

  static get_styles () {
    if (!this.promise_styles) {
      this.promise_styles = this.prepare_styles()
    }
    return this.promise_styles
  }

  static async prepare_styles () {
    let styles = this.styles
    if (styles) {
      return `<style>${styles}</style>`
    }

    let style_urls = this.style_urls
    if (!style_urls) {
      return ''
    }
    if (style_urls.length === 0) {
      return ''
    }
    let base_url = this.base_url
    base_url = base_url.replace('/index.js', '/')
    style_urls = style_urls.map((style_url) => {
      return Path.join(base_url, style_url)
    })

    let style_text = await this.fetch_styles(style_urls)

    return style_text
  }

  static async fetch_styles (style_urls) {
    let styles_text = ''

    for (let style_url of style_urls) {
      let style_text = await this.fetch_style(style_url)
      styles_text += `<style>\n${style_text}\n</style>\n`
    }

    return styles_text
  }

  static async fetch_style (style_url) {
    try {
      let res = await fetch(style_url)
      let style_text = await res.text()
      return style_text
    } catch (err) {
      console.warn(err)
      return ''
    }
  }

  async init () {
    super.init()
    await this.locks.unlocked('connected')
    this.html_styles = await this.constructor.get_styles()
    this.locks.unlock('styles')
  }

}