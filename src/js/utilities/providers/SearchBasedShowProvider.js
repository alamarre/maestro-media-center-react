export default class SearchBasedShowProvider {
  constructor(apiRequester, cacheProvider, showProgressProvider, searchProvider) {
    this.apiRequester = apiRequester;
    this.cacheProvider = cacheProvider;
    this.showProgressProvider = showProgressProvider;
    this.searchProvider = searchProvider;
  }

  getListingPromise(folder) {
    var promise = new Promise((good, bad) => {
      if(!folder || folder === "") {
        good({files: [], folders: ["TV Shows", "Movies",],});
      } else {
        const type = (folder == "Movies" || folder == "/Movies") ? "movie" : "tv";

        this.searchProvider.getByType(type).then((results) => {
          good({folders:[], files: results,});
        }, bad);

      }
    });

    return promise;
  }

  async getVideoSource(path) {
    return await this.apiRequester.apiRequestPromise("folders", `sources?path=${encodeURIComponent(path)}`, {});
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


