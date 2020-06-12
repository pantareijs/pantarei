
class Cache {

  constructor (name) {
    this.name = name
  }

  async open () {
    if (!this._cache) {
      this._cache = await caches.open(this.name)
    }
  }

  async add (files) {
    await this.open()
    await this._cache.addAll([].concat(files))
  }

  async delete (request) {
    await this.open()
    let response = await this._cache.delete(request)
    return response
  }

  async match (request) {
    await this.open()
    let response = await this._cache.match(request)
    return response
  }

  async put (request, response) {
    await this.open()
    await this._cache.put(request, response.clone())
  }
}

self.Cache = Cache

class CacheStorage {

  static async clear (whitelist) {
    let caches_keys = await caches.keys()
    for (let cache_key of caches_keys) {
      if (!whitelist.includes(cache_key)) {
        caches.delete(cache_key)
      }
    }
  }

}

self.CacheStorage = CacheStorage

class Service {

  constructor (name) {
    this.name = name
    this.cache = new Cache(name)

    this.on_install = this.on_install.bind(this)
    this.on_activate = this.on_activate.bind(this)
    this.on_fetch = this.on_fetch.bind(this)
    this.on_push = this.on_push.bind(this)
  }

  on_install (event) {
    let promise = this.install()
    event.waitUntil(promise)
  }

  on_activate (event) {
    let promise = this.activate()
    event.waitUntil(promise)
  }

  on_fetch (event) {
    let request = event.request
    let promise = this.fetch(request)
    event.respondWith(promise)
  }

  on_push (event) {
    let promise = this.push()
    event.waitUntil(promise)
  }

  async install () {
    await CacheStorage.clear([this.name])
  }

  async activate () {
    await Promise.resolve()
  }

  async push () {
    await Promise.resolve()
  }

  async fetch (request) {
    let promise_fetched_response = this.update_request(request)
    let promise_matched_response = this.match_request(request)

    let matched_response = await promise_matched_response
    if (matched_response) {
      return matched_response
    }

    let fetched_response = await promise_fetched_response
    if (fetched_response) {
      return fetched_response
    }
  }

  async update_request (request) {
    let [error, response] = await this.fetch_request(request)
    if (error) {
      return error
    }
    if (response.status !== 200) {
      return response
    }
    await this.cache_request(request, response)
    return response
  }

  async fetch_request (request) {
    try {
      let cloned_request = request.clone()
      let response = await fetch(cloned_request)
      return [null, response]
    } catch (error) {
      return [error, null]
    }
  }

  async match_request (request) {
    let response = await this.cache.match(request)
    return response
  }

  async cache_request (request, response) {
    let cloned_request = request.clone()
    let cloned_response = response.clone()
    await this.cache.put(cloned_request, cloned_response)
  }

}

self.Service = Service
