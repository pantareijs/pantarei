'use strict'

import Emitter from '../emitter/index.js'
import Path from '../path/index.js'
import Route from '../route/index.js'

export default class Navigator {

  constructor (register) {
    this.events = new Emitter()
    this.register = register
    this.pages_root = 'pages/'
  }

  async start () {
    this._started = true
  }

  async match (path) {
    let base_root = location.pathname.replace('index.html', '')

    let pages_root = this.pages_root
    let segments = Path.split(path)
    let current_path = ''

    let pages = []
    let params = []

    let page = null
    let page_name = 'page'
    let page_path = pages_root

    if (!segments.length) {
      page_path = '/' + Path.join(base_root, page_path, 'index.js')
      page_name = 'page-home'
      try {
        let page_module = await import(page_path)
        page = page_module.default
        page.base_url = page_path
      } catch (error) {
        console.warn(error)
      }
      let route = { component: page, component_name: page_name }
      let matching = { params, route, path: page_path }
      return matching
    }

    for (let segment of segments) {
      let page_module = null
      try {
        let next_page_path = '/' + Path.join(base_root, page_path, segment, 'index.js')
        page_module = await import(next_page_path)
        page = page_module.default
        page.base_url = next_page_path
      } catch (error) {
        console.warn(error)
      }
      if (page_module) {
        page_name += '-' + segment
        page_path = Path.join(page_path, segment)
        pages.push(page)
        continue
      }
      page_module = null
      try {
        let default_page_path = '/' + Path.join(base_root, page_path, 'default', 'index.js')
        page_module = await import(default_page_path)
        page = page_module.default
        page.base_url = default_page_path
      } catch (error) {
        console.warn(error)
      }
      if (page_module) {
        page_name += '-' + 'default'
        page_path = Path.join(page_path, 'default')
        params.push(segment)
        pages.push(page)
        continue
      }
      break
    }

    if (pages.length !== segments.length) {
      let route = null
      let matching = { params, route }
      return matching
    }

    let route = { component: page, component_name: page_name }
    let matching = { params, route, path: page_path }
    return matching
  }

  async navigate (path) {
    let matching = await this.match(path)

    if (!matching.route) {
      return
    }

    this.events.emit('change', matching)
  }

}