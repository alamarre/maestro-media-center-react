import elasticlunr from "elasticlunr";

function addFilesInFolder(index, currentCache, path) {
  if (currentCache && currentCache.files) {
    const fileNames = Object.keys(currentCache.files).sort(window.tvShowSort);
    let episodeCount = 0;
    for (const file of fileNames) {
      const filePath = path + "/" + file;
      const doc = {
        path: filePath,
        type: "movie",
        index: episodeCount++,
        title: file,
      };

      index.addDoc(doc);
    }
  }

  if (currentCache.folders) {
    for (const folder in currentCache.folders) {
      addFilesInFolder(index, currentCache.folders[folder], path + "/" + folder);
    }
  }
}

export default class CacheBasedSearch {
  constructor(cacheProvider, playlistProvider) {
    this.cacheProvider = cacheProvider;
    this.cacheIndex = null;
    this.indexPromise = null;
    this.playlistProvider = playlistProvider;

    this.createIndex();
  }

  createIndex() {
    this.indexPromise = new Promise((s, f) => {
      Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders(),]).then((values) => {
        const cache = values[0];
        const rootFolders = values[1];
        const index = elasticlunr(function () {
          this.addField("title");
          this.addField("type");
          this.addField("index");
          this.setRef("path");
        });

        this.cacheIndex = index;

        elasticlunr.clearStopWords();

        for (const folder of rootFolders) {
          if (folder.type && folder.type.toLowerCase() === "tv") {
            const rootFolder = cache.folders[folder.name];
            if (rootFolder) {
              for (const showName in rootFolder.folders) {
                const doc = {
                  path: folder.name + "/" + showName,
                  title: showName,
                  type: "tv",
                  index: 0,
                };

                index.addDoc(doc);
              }
            }
          } else if (folder.type && folder.type.toLowerCase() === "collection") {
            const rootFolder = cache.folders[folder.name];

            for (const collection of rootFolder.files) {
              const filePath = folder.name + "/" + collection;
              const doc = {
                path: filePath,
                type: "collection",
                title: collection,
              };

              index.addDoc(doc);
            }
          } else {
            // loop through all folders and add shows
            addFilesInFolder(index, cache.folders[folder.name], folder.name);
          }
        }
        this.playlistProvider.getPlaylists().then(playlists => {
          for (const playlist of playlists) {
            const doc = {
              type: "playlist",
              title: playlist.name,
              path: "playlists/" + playlist.name,
            };

            index.addDoc(doc);
          }
          s();
        });
      }, f);
    });
  }


  getTvShows() {
    return this.getByType("tv");
  }

  getMovies() {
    return this.getByType("movie");
  }

  getByType(contentType) {
    return new Promise((success, fail) => {
      this.indexPromise.then(() => {
        const result = this.cacheIndex.search(contentType, {
          fields: {
            type: { boost: 2, },
          },
          expand: true,
        });

        let results = result.map((item) => {
          const doc = this.cacheIndex.documentStore.getDoc(item.ref);
          return {
            type: doc.type,
            path: item.ref,
            index: doc.index,
            name: item.ref.substring(item.ref.lastIndexOf("/") + 1),
          };
        });

        results = results.sort((a, b) => {
          return window.tvShowSort(a.name, b.name);
        });
        success(results);
      }, fail);
    });
  }

  getResults(value) {
    return new Promise((success, fail) => {
      this.indexPromise.then(() => {
        const result = this.cacheIndex.search(value, {
          fields: {
            title: { boost: 2, },
          },
          expand: true,
        });
        const results = result.map((item) => {
          const doc = this.cacheIndex.documentStore.getDoc(item.ref);
          return {
            path: item.ref,
            index: doc.index,
            type: doc.type,
            name: item.ref.substring(item.ref.lastIndexOf("/") + 1),
          };
        });
        success(results);
      }, fail);
    });
  }
}


