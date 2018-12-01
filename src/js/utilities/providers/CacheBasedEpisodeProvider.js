class CacheBasedEpisodeProvider {
  constructor(apiRequester, cacheProvider, showProgressProvider) {
    this.apiRequester = apiRequester;
    this.cacheProvider = cacheProvider;
    this.showProgressProvider = showProgressProvider;
  }

  getListingPromise(folder) {
    var promise = new Promise((good, bad) => {
      this.cacheProvider.getCache()
        .then((cache) => {
          let current = cache;
          if(folder.startsWith("/")) {
            folder = folder.substring(1);
          }
          const folders = folder.split("/");
          for (let i = 0; i < folders.length; i++) {
            if(folders[i]) {
              current = current.folders[folders[i]];
            }
          }

          const result = {};
          result.folders = Object.keys(current.folders);
          result.files = Object.keys(current.files);

          result.files = result.files.filter((file) => {
            return file.indexOf(".mp4") == (file.length - ".mp4".length);
          });

          result.files = result.files.sort(window.tvShowSort);

          good(result);
        }, bad);
    });

    return promise;
  }

  recordProgress(video, status) {
    this.cacheProvider.getRootFolders().then((rootFolders) => {
      if (video.startsWith("/")) {
        video = video.substring(1);
      }

      const parts = video.split("/");
      const rootFolder = rootFolders[parts[0]];
      if (rootFolder
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

  getRootPath() {
    return this.apiRequester.getHost() + "/videos";
  }

}

module.exports = CacheBasedEpisodeProvider;
