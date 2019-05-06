const localforage = require("localforage");

class CacheProvider {
  constructor(apiRequester, options = {}) {
    this.apiRequester = apiRequester;
    this.cachePromise = null;
    this.rootFoldersPromise = null;
    if(options.noPreload) {
      this.getCache().catch(() => { });
      this.getRootFolders().catch(() => { });
    }
  }

  async getCache() {
    if (!this.cachePromise) {
      this.cachePromise = this.fetchCache();

    }

    return this.cachePromise;
  }

  async fetchCache() {
    try {
      const result = await this.apiRequester.apiRequestPromise("folders", "cache", {});
      await localforage.setItem("cache", result);
      return result;
    } catch (e) {
      return await localforage.getItem("cache");
    }
  }

  reload() {
    this.cachePromise = null;
    this.getCache();
    this.rootFoldersPromise = null;
    this.getRootFolders();
  }

  isTvShow(path) {
    if (path.indexOf("/") == 0) {
      path = path.substring(1);
    }

    return new Promise((s, f) => {
      this.getRootFolders().then((rootFolders) => {
        const parts = path.split("/");
        for (const rootFolder of rootFolders) {
          if (rootFolder.name === parts[0]) {
            s(rootFolder.type && rootFolder.type.toLowerCase() === "tv");
            return;
          }
        }
        f();
      }, f);
    });
  }

  async getShowPath(showName) {
    const cache = await this.getCache();
    const rootFolders = await this.getRootFolders();
    for (const folder of rootFolders) {
      if (folder.type && folder.type.toLowerCase() === "tv") {
        const rootFolder = cache.folders[folder.name];
        if (rootFolder.folders[showName]) {
          return folder.name + "/" + showName;
        }
      }
    }
  }

  getCacheFromPath(path) {
    return new Promise((s, f) => {
      this.getCache().then(cache => {
        if (path.indexOf("/") == 0) {
          path = path.substring(1);
        }

        const parts = path.split("/");
        let current = cache;
        for (var i = 0; i < parts.length; i++) {
          current = current.folders[parts[i]];
        }

        if (current && current.folders && current.folders.sort) {
          current.folders = current.folders.sort(tvShowSort);
        }

        if (current && current.files && current.files.sort) {
          current.files = current.files.sort(tvShowSort);
        }

        s(current);
      }, f);
    });
  }

  getRootFolders() {
    if (!this.rootFoldersPromise) {
      this.rootFoldersPromise = this.fetchRootFolders();
    }
    this.rootFoldersPromise.then(rootFolders => {
      this.rootFolders = rootFolders;
    });

    return this.rootFoldersPromise;
  }

  async fetchRootFolders() {
    try {
      const result = this.apiRequester.apiRequestPromise("folders", "root", {});
      await localforage.setItem("rootFolders", result);
      return result;
    } catch (e) {
      return await localforage.getItem("rootFolders");
    }
  }
}

module.exports = CacheProvider;
