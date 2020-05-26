
export default class Assert {

  static string (value) {
    if (typeof value !== 'string') {
      throw new TypeError('argument must be a string')
    }
  }

  static function (value) {
    if (typeof value !== 'function') {
      throw new TypeError('argument must be a function')
    }
  }

}