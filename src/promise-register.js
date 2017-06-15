export class PromiseRegister {

  constructor () {
    this.prepared = {}
    this.resolved = {}
  }

  prepare (name) {
    if (this.prepared[name]) {
      return
    }

    this.prepared[name] = new Promise((resolve, reject) => {
      this.resolved[name] = resolve
    })
  }

  retrieve (name) {
    this.prepare(name)
    return this.prepared[name]
  }

  register (name, item) {
    this.prepare(name)
    this.resolved[name](item)
  }

  unregister (name) {
    delete this.prepared[name]
  }

  contains (name) {
    return this.prepared[name]
  }

}
