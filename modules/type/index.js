
export default class Type {

  static string (value) {
    return typeof value === 'string'
  }

  static function (value) {
    return typeof value === 'function'
  }

  static undefined (value) {
    return typeof value === 'undefined'
  }

}