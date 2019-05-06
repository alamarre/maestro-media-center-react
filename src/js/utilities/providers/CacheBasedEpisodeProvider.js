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

  async getVideoSource(path) {
    return await this.apiRequester.apiRequestPromise("folders", `sources?path=${encodeURIComponent(path)}`, {});
  }

  async getServers() {
    return await this.apiRequester.apiRequestPromise("servers", "", {});
  }

  async getAvailableLocalSource(source) {
    const url = new URL(source);
    const servers = await this.getServers();
    const matching = servers.filter( s => s.publicHostname === url.hostname);
    if(matching.length === 1) {
      const server = matching[0];
      try {
        const result = await fetch((server.scheme || "http") +"://"+server.ip+":"+server.port+"/health");
        const body = await result.json();
        if(!body.clientIp) {
          return null;
        }
      }
      catch(e) {
        return null;
      }
      const resultUrl = (server.scheme || "http") +"://"+server.ip+":"+server.port+url.pathname + url.search;
      return resultUrl;
    }

    return null;
  }


}

module.exports = CacheBasedEpisodeProvider;
