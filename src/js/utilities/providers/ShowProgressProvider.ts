import ApiCaller from "./ApiCaller";
import ICacheProvider from "./ICacheProvider";
import KeepWatching from "../../models/KeepWatchingData";
export default class ShowProgressProvider {
  private last;
  constructor(private apiCaller: ApiCaller, private cacheProvider: ICacheProvider) {
    this.last = {};
  }

  async getShowsInProgress() {
    return await this.apiCaller.get<KeepWatching[]>("shows", "keep-watching");
  }

  async getShowProgress(showName) {
    try {
      const shows = await this.getShowsInProgress();
      for (const show of shows) {
        if (show.show === showName) {
          return show;
        }
      }
    } catch (e) {
      return null;
    }

  }

  async getShowInfo(path) {
    const rootFolders = await this.cacheProvider.getRootFolders();
    while (path.startsWith("/")) {
      path = path.substring(1);
    }

    const parts = path.split("/");
    const rootFolderName = parts.shift();
    for (const folder of rootFolders) {
      if (folder.name == rootFolderName) {
        if (parts.length == 3 && folder.type && folder.type.toLowerCase() === "tv") {
          const show = parts[0];
          const season = parts[1];
          const episode = parts[2];

          return { show, season, episode, };
        } else if (folder.type && folder.type.toLowerCase() === "collection") {
          return { show: "collection", episode: parts[0], };
        } else if (folder.type && folder.type.toLowerCase() === "playlist") {
          return { show: "playlist", episode: parts[0], };
        } else if (!folder.type || folder.type.toLowerCase() !== "tv") {
          return { show: "movie", episode: path, };
        }
      }
    }
    return null;
  }

  async markStatus(path, status, progress) {
    if (path === this.last.path
      && status === this.last.status
      && progress === this.last.progress) {
      return;
    }
    this.last = { path, status, progress, };
    const rootFolders = await this.cacheProvider.getRootFolders();

    while (path.startsWith("/")) {
      path = path.substring(1);
    }

    const parts = path.split("/");
    const rootFolderName = parts.shift();
    if (rootFolderName == "Playlist") {
      return await this.apiCaller.post("shows", "keep-watching",
        {
          show: "playlist",
          season: parts[0],
          episode: parts[1],
          status: status,
          progress: progress,
        });
    }
    for (const folder of rootFolders) {
      if (folder.name == rootFolderName) {
        if (parts.length == 3 && folder.type && folder.type.toLowerCase() === "tv") {
          const show = parts[0];
          const season = parts[1];
          const episode = parts[2];

          this.markEpisodeStatus(show, season, episode, status, progress);
        } else if (folder.type && folder.type.toLowerCase() === "collection") {
          return await this.apiCaller.post("shows", "keep-watching",
            {
              show: "collection",
              season: parts[0],
              episode: parts[1],
              status: status,
              progress: progress,
            });
        } else if (!folder.type || folder.type.toLowerCase() === "movie") {
          return await this.apiCaller.post("shows", "keep-watching",
            {
              show: "movie",
              season: null,
              episode: path,
              status: status,
              progress: progress,
            });
        }
      }

    }
  }

  async markEpisodeStatus(show, season, episode, status, progress) {
    return await this.apiCaller.post("shows", "keep-watching",
      {
        show: show,
        season: season,
        episode: episode,
        status: status,
        progress: progress,
      });
  }
}


