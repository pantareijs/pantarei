
export default class Assert {

  static string (argument) {
    if (typeof param !== 'string') {
      throw new TypeError('argument must be a string')
    }
  }

  static function (argument) {
    if (typeof param !== 'function') {
      throw new TypeError('argument must be a function')
    }
  }

}