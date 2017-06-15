export class ExpressionPath {

  constructor (path) {
    let parts = path.split('.')
    let n = parts.length

    if (n == 1) {
      this.evaluator = (value) => {
        return value[path]
      }
      return
    }

    this.evaluator = (value) => {
      for (let i = 0; i < n && value; i++) {
        let part = parts[i]
        value = value[part]
      }
      return value
    }
  }

  evaluate (context) {
    return this.evaluator(context)
  }

}