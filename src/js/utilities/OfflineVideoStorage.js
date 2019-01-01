import localforage from "localforage";
const $ = require("jquery");
const sliceSize = 1024 * 1024 * 100;

class OfflineVideoStorage {

  constructor() {
    this._hasOffline = false;
    this._load();
  }

  async _load() {

    this.dbStore = localforage.createInstance({
      name: "maestro-metadata",
    });
    await this.dbStore.setDriver(localforage.INDEXEDDB);

    this.movieStore = localforage.createInstance({
      name: "maestro-movies",
    });
    await this.movieStore.setDriver(localforage.INDEXEDDB);


    this._hasOffline = (await this.dbStore.length()) > 0;
  }

  canStoreOffline() {
    return true;
  }

  hasOfflineVideos() {
    return this._hasOffline;
  }

  async getVideoList() {
    const keys = await this.dbStore.keys();
    return Promise.all(keys.map(async key => {
      const data = await this.dbStore.getItem(key);
      data.url = key;
      return data;
    }));
  }

  async saveVideo(videoData, url, progressFunction) {
    try {
      let data = await $.ajax(url, {
        xhr: () => {
          if (typeof progressFunction === "function") {

            const xhr = new window.XMLHttpRequest();
            xhr.responseType = "blob";
            // Download progress listener
            xhr.addEventListener("progress", (e) => {

              progressFunction(100 * e.loaded / e.total);
            }, false);
            return xhr;
          }
          return $.ajaxSettings.xhr();
        },
      });

      if (typeof data === "string") {
        data = new Blob([data,]);
      }
      const size = data.size;

      const numSlices = Math.ceil(size / sliceSize);
      const slices = [];
      let start = 0;
      for (let i = 0; i < numSlices; i++) {
        let end = start + sliceSize;
        if (end >= size) {
          end = undefined;
        }
        slices[i] = data.slice(start, end);
        start = end;
        await this.movieStore.setItem(`slice-${i}-${url}`, slices[i]);
      }
      await this.movieStore.setItem(`metadata-${url}`, { numSlices, });
      await this.dbStore.setItem(url, videoData);
      progressFunction(100);

      this._hasOffline = true;

      const event = new CustomEvent("maestro-offline-change", { detail: { offline: this._hasOffline, }, });

      document.dispatchEvent(event);
    } catch (e) {
      console.log(e);
    }

  }

  async delete(url) {
    const { numSlices, } = await this.movieStore.getItem(`metadata-${url}`);
    for (let i = 0; i < numSlices; i++) {
      await this.movieStore.removeItem(`slice-${i}-${url}`);
    }
    await this.movieStore.removeItem(`metadata-${url}`);
    await this.dbStore.removeItem(url);
    this._hasOffline = (await this.dbStore.length()) > 0;

    const event = new CustomEvent("maestro-offline-change", { detail: { offline: this._hasOffline, }, });

    document.dispatchEvent(event);
  }

  async getVideo(url) {
    const data = await this.movieStore.getItem(`metadata-${url}`);
    if (!data) {
      return null;
    }
    const numSlices = data.numSlices;
    const slices = [];
    for (let i = 0; i < numSlices; i++) {
      slices.push(await this.movieStore.getItem(`slice-${i}-${url}`));
    }
    return new Blob(slices, { type: "video/mp4", });
  }
}

module.exports = OfflineVideoStorage;
