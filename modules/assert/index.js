
import Type from '../type/index.js'

export default class Assert {

  static string (value) {
    if (Type.string(value)) {
      return true
    }
    throw new TypeError('argument must be a string')
  }

  static function (value) {
    if (Type.function(value)) {
      return true
    }
    throw new TypeError('argument must be a function')
  }

  static defined (value) {
    if (Type.defined(value)) {
      return true
    }
    throw new TypeError('argument must be defined')
  }

}