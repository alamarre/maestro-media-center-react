import ApiCaller from "./ApiCaller";
import ICacheProvider from "./ICacheProvider";
import SearchCache from "../../models/SearchCache";
export default class SearchBasedShowProvider {
  constructor(
    private apiCaller: ApiCaller,
    private cacheProvider: ICacheProvider,
    private showProgressProvider,
    private searchProvider) {
  }

  async getListingPromise(folder): Promise<SearchCache> {
    if (!folder || folder === "") {
      return { files: [], folders: ["TV Shows", "Movies",], };
    } else {
      const type = (folder == "Movies" || folder == "/Movies") ? "movie" : "tv";

      const results = await this.searchProvider.getByType(type);

      return { folders: [], files: results, };
    }
  }

  async getVideoSource(path) {
    return await this.apiCaller.get("folders", `sources?path=${encodeURIComponent(path)}`);
  }

  async recordProgress(video, status) {
    const rootFolders = await this.cacheProvider.getRootFolders();

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

      await this.showProgressProvider.markEpisodeStatus(show, season, episode, status);
    }
  }

}


