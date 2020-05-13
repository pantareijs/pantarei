
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
    event.waitUntil(this.installing())
  }

  on_activate (event) {
    event.waitUntil(this.activating())
  }

  on_fetch (event) {
    let request = event.request
    let promise_response = this.fetching(request)
    event.respondWith(promise_response)
  }

  on_push (event) {
    event.waitUntil(this.pushing())
  }

  async installing () {
    await CacheStorage.clear([this.name])
  }

  async activating () {}

  async fetch (request) {
    try {
      let response = await fetch(request)
      return [null, response]
    } catch (error) {
      return [error]
    }
  }

  async fetching (request) {
    let [error, response] = await this.fetch(request)

    if (response) {
      await this.fetched(request, response)
      return response
    }

    let cached_response = await this.cache.match(request)
    if (cached_response) {
      return cached_response
    }
  }

  async fetched (request, response) {
    if(!response || response.status !== 200) {
      return
    }
    let cloned_request = request.clone()
    let cloned_response = response.clone()
    await this.cache.put(cloned_request, cloned_response)
  }

  async pushing () {}

}

self.Service = Service
