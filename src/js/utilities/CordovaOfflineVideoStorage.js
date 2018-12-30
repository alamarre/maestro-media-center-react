import localforage from "localforage";

function createDirectoryPromise(dirEntry, directoryName) {
  return new Promise((s, f) => {
    dirEntry.getDirectory(directoryName, { create: true, }, s, f);
  });
}

async function createDirectoryPath(dirEntry, path) {
  const parts = path.split("/");
  if(!parts[0]) {
    parts.pop();
  }

  let current = dirEntry;
  for(let i=0; i<parts.length; i++) {
    current = await createDirectoryPromise(current, parts[i]);
  }
  return current;
}

async function getFileFromPath(dirEntry, options, path) {
  const parts = path.split("/");
  if(!parts[0]) {
    parts.pop();
  }
  const file = parts.splice(-1,1)[0];
  const dir = await createDirectoryPath(dirEntry, parts.join("/"));
  return await getFilePromise(dir, options, file);
}

function getFilePromise(dirEntry, options, fileName) {
  return new Promise((s, f) => {
    dirEntry.getFile(fileName, options, s, f);
  });
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

    window.resolveLocalFileSystemURL(window.cordova.file.documentsDirectory, dirEntry => {
      dirEntry.getDirectory("NoCloud", {}, noSyncDir => {
        this.noSyncDir = noSyncDir;
      });
    });

    this._hasOffline = (await this.dbStore.length()) > 0;
  }

  canStoreOffline() {
    const cordova = window.cordova;
    return cordova && cordova.file;
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
    const headers = {};
    let start = 0;
    const fetchSize = 1024 * 1024;
    headers["Range"] = `bytes=0-${fetchSize}`;
    try {
      
      let response = await fetch(url, {headers,});
      let data = await response.blob();
      const total = parseInt(response.headers.get("Content-Range").split("/")[1]);
      
      progressFunction({state: "Downloading", progress:  0.0,});
      
      const fileEntry = await getFileFromPath(this.noSyncDir, {create: true,}, videoData.path+".mp4");
      fileEntry.createWriter(fileWriter => {
        fileWriter.onwriteend = async () => {
          start += fetchSize +1;
          
          if(start < total) {
            progressFunction({state: "Downloading", progress: 100 * start / total,});
            headers["Range"] = `bytes=${start}-${start+fetchSize}`;
            response = await fetch(url, {headers,});
            data = await response.blob();
            fileWriter.write(data);
          } else {
            console.log("Successful file read...");
            progressFunction({state: "Saved", progress: 100,});
            this._hasOffline = true;
            const event = new CustomEvent("maestro-offline-change", { detail: { offline: this._hasOffline, }, });
            document.dispatchEvent(event);
            await this.dbStore.setItem(url, videoData);
          }
        };
        
        fileWriter.onerror = function (e) {
          console.log("Failed file read: " + e.toString());
          progressFunction({state: "Error "+ e.toString(), progress: null,});
        };

        fileWriter.write(data);
      });
    }catch(e) {
      progressFunction({state: "Error "+e.toString(),});
    }
  }

  async delete(url) {
    await this.dbStore.removeItem(url);
    this._hasOffline = (await this.dbStore.length()) > 0;

    const event = new CustomEvent("maestro-offline-change", { detail: { offline: this._hasOffline, }, });

    document.dispatchEvent(event);
  }

  async getVideo(url) {
    const {videoData,} = await this.dbStore.getItem(`${url}`);
    if (!videoData) {
      return null;
    }

    const file = await getFileFromPath(this.noSyncDir, {create: false,}, videoData.path);
    if(!file) {
      return;
    }


  }
}

module.exports = OfflineVideoStorage;
