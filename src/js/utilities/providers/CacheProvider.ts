import ApiCaller from "./ApiCaller";
import FileCache from "../../models/FileCache";
import RootFolder from "../../models/RootFolder";
const localforage = require("localforage");

export default class CacheProvider {
  private apiCaller: ApiCaller;
  private cachePromise: Promise<FileCache>;
  private rootFoldersPromise: Promise<RootFolder[]>;

  constructor(apiCaller) {
    this.apiCaller = apiCaller;
    this.cachePromise = null;
    this.rootFoldersPromise = null;
    this.getCache().catch(() => { });
    this.getRootFolders().catch(() => { });
  }

  async getCache(): Promise<FileCache> {
    if (!this.cachePromise) {
      this.cachePromise = this.fetchCache();

    }

    return this.cachePromise;
  }

  async fetchCache(): Promise<FileCache> {
    try {
      const result: FileCache = await this.apiCaller.get<FileCache>("folders", "cache");
      await localforage.setItem("cache", result);
      return result;
    } catch (e) {
      return await localforage.getItem("cache");
    }
  }

  async reload(): Promise<void> {
    this.cachePromise = null;
    await this.getCache();
    this.rootFoldersPromise = null;
    await this.getRootFolders();
  }

  isTvShow(path): Promise<boolean> {
    if (path.indexOf("/") == 0) {
      path = path.substring(1);
    }

    return new Promise((s, f) => {
      this.getRootFolders().then((rootFolders) => {
        const parts = path.split("/");
        for (const rootFolder of rootFolders) {
          if (rootFolder.name === parts[0]) {
            return s(rootFolder.type && rootFolder.type.toLowerCase() === "tv");
          }
        }
        f();
      }, f);
    });
  }

  async getShowPath(showName): Promise<string> {
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

  getCacheFromPath(path): Promise<FileCache> {
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

        s(current);
      }, f);
    });
  }

  getRootFolders(): Promise<RootFolder[]> {
    if (!this.rootFoldersPromise) {
      this.rootFoldersPromise = this.fetchRootFolders();
    }

    return this.rootFoldersPromise;
  }

  async fetchRootFolders(): Promise<RootFolder[]> {
    try {
      const result = this.apiCaller.get<RootFolder[]>("folders", "root");
      await localforage.setItem("rootFolders", result);
      return result;
    } catch (e) {
      return await localforage.getItem("rootFolders");
    }
  }
}
