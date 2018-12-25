import localforage from "localforage";

function getBase64String(data) {
  const chunkSize = 1024;
  let binaryString = "";
  for(let i=0; i<data.byteLength; i+= chunkSize) {
    const start = i;
    const end = Math.min(start+chunkSize, data.byteLength);
    const buffer = data.slice(start, end);
    binaryString += String.fromCharCode(...new Uint8Array(buffer));
  }
  const base64String = btoa(binaryString);
  return base64String;
}

class OfflineVideoStorage {

  constructor(episodeLoader) {
    this._hasOffline = false;
    this.episodeLoader = episodeLoader;
    this._load();
  }

  async _load() {

    this.dbStore = localforage.createInstance({
      name: "maestro-metadata",
    });
    await this.dbStore.setDriver(localforage.INDEXEDDB);

    this._hasOffline = (await this.dbStore.length()) > 0;
    const cordova = window.cordova;
    if(cordova  && cordova.plugins && cordova.plugins.photoLibrary) {
      cordova.plugins.photoLibrary.requestAuthorization(
        function () {
          // User gave us permission to his library, retry reading it!
        },
        function (err) {
          console.error(err);
          // User denied the access
        }, // if options not provided, defaults to {read: true}.
        {
          read: true,
          write: true,
        }
      );
    }
  }

  canStoreOffline() {
    const cordova = window.cordova;
    return cordova && cordova.plugins && cordova.plugins.photoLibrary;
  }

  hasOfflineVideos() {
    return this._hasOffline;
  }

  async getVideoList() {
    const keys = await this.dbStore.keys();
    return Promise.all(keys.map(async key => {
      const {videoData,} = await this.dbStore.getItem(key);
      videoData.url = key;
      return videoData;
    }));
  }

  async saveVideo(videoData, path, progressFunction) {
    const sourceInfo = await this.episodeLoader.getVideoSource(path);
    const {sources,} =  sourceInfo;
    if(sources.length < 1) {
      return;
    }
    // our URLs aren't always properly encoded so fix it before the cordova code fails
    const url = new URL(sources[0]).href;
    progressFunction({state: "Downloading", progress:  0,});
    /*try {
      const data = await $.ajax(url, {
        xhr: () => {
          if (typeof progressFunction === "function") {
            const xhr = new window.XMLHttpRequest();
            xhr.responseType = "arraybuffer";
            // Download progress listener
            xhr.addEventListener("progress", (e) => {
  
              progressFunction({state: "Downloading", progress: 100 * e.loaded / e.total,});
            }, false); 
            return xhr;
          }
          return $.ajaxSettings.xhr();
        },
      });
  
      const base64String = getBase64String(data);
      const dataUrl = "data:video/mp4;base64,"+base64String;
      progressFunction({state: "Saving", progress:  1,});
      */
      
    window.cordova.plugins.photoLibrary.saveVideo(url, "Maestro", async (libraryItem) => {
      await this.dbStore.setItem(url, {videoData, libraryItem,});

      progressFunction({state: "Saved", progress: 100,});

      this._hasOffline = true;

      const event = new CustomEvent("maestro-offline-change", { detail: { offline: this._hasOffline, }, });
      document.dispatchEvent(event);
    }, (err) => {
      throw err;
    });
    

  }

  async delete(url) {
    await this.dbStore.removeItem(url);
    this._hasOffline = (await this.dbStore.length()) > 0;

    const event = new CustomEvent("maestro-offline-change", { detail: { offline: this._hasOffline, }, });

    document.dispatchEvent(event);
  }

  async getVideo(url) {
    const {libraryItem,} = await this.dbStore.getItem(`${url}`);
    if (!libraryItem) {
      return null;
    }
    return await this._getLibraryItem(libraryItem); 
  }

  _getLibraryItem(libraryItem) {
    return new Promise((s, f) => {
      window.cordova.plugins.photoLibrary.getLibraryItem(libraryItem, s, f);
    });
  }
}

module.exports = OfflineVideoStorage;
