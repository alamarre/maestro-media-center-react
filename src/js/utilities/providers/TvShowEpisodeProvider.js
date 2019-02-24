class TvShowEpisodeProvider {
  constructor(apiRequester, cacheProvider, showProgressProvider) {
    this.apiRequester = apiRequester;
    this.cacheProvider = cacheProvider;
    this.showProgressProvider = showProgressProvider;
  }

  getListingPromise(folder) {
    var promise = new Promise((good, bad) => {
      Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders(),]).then((values) => {
        const cache = values[0];
        const rootFolders = values[1];
                
        for(const folder of rootFolders) {
          if(folder.type && folder.type.toLowerCase() === "tv") {
            const rootFolder = cache.folders[folder.name];
            if(rootFolder) {
              for(const showName in rootFolder.folders) {
                const doc = {
                  path: folder.name + "/" + showName,
                  title: showName,
                  type: "tv",
                };
                                
                index.addDoc(doc);
              }
            }
          } else {
            // loop through all folders and add shows
            addFilesInFolder(index, cache.folders[folder.name], folder.name);
          }
        }
        s();
      }, f);
      this.cacheProvider.getCache()
        .then((cache) => {
          let current = cache;
          const folders = folder.split("/");
          for(let i=0; i< folders.length; i++) {
            current = current.folders[folder];
          }
                
          const result = {};
          result.folders = Object.keys(current.folders);
          result.files = Object.keys(current.files);

          result.files = result.files.sort(window.tvShowSort);

          good(result);
        }, bad);
    });

    return promise;
  }
    
  recordProgress(video, status) {
    this.cacheProvider.getRootFolders().then((rootFolders) => {
      if(video.startsWith("/")) {
        video = video.substring(1);
      }
           
      const parts = video.split("/");
      const rootFolder = rootFolders[parts[0]];
      if(rootFolder 
               && rootFolder.type 
               && rootFolder.type.toLowerCase() === "tv"
               && parts.length === 4) {
        const show = parts[1];
        const season = parts[2];
        const episode = parts[3];
               
        this.showProgressProvider.markEpisodeStatus(show, season, episode, status);
      }
           
    });
  }
}

module.exports = TvShowEpisodeProvider;