
export function __import__ (url) {
  return import(url)

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const temp = '_' + Math.random().toString(32).substring(2)

    window[temp] = function (m) {
      resolve(m)
    }

    script.type = 'module'
    script.textContent = `
      import * as m from "${url}"
      window["${temp}"](m)
      delete window["${temp}"]
    `

    window.document.body.appendChild(script)
  })
}
