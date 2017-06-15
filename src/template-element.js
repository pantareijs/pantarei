import { PromiseRegister } from './promise-register'

const register = new PromiseRegister()

export class TemplateElement extends HTMLElement {

  static get is () { return 'template-element' }

  constructor () {
    super()
    this._observer = new MutationObserver(this._register.bind(this))
    this._observer.observe(this, { childList: true })
    this._register()
  }

  _register () {
    if (this._registered) {
      this._observer.disconnect()
      return
    }
    let template = this.querySelector('template')
    if (!template) {
      return
    }
    let name = this.id
    if (!name) {
      return
    }
    register.register(name, template)
    this._registered = true
  }

}

customElements.define(TemplateElement.is, TemplateElement)
