class ShowProgressProvider {
  constructor(apiRequester, cacheProvider) {
    this.apiRequester = apiRequester;
    this.cacheProvider = cacheProvider;
  }

  getShowsInProgress() {
    return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
      type: "GET",
    });
  }

  getShowProgress(showName) {
    return this.getShowsInProgress().then(shows => {
      for (const show of shows) {
        if (show.show === showName) {
          return show;
        }
      }
      return null;
    }).catch(() => {
      return null;
    });
  }

  getShowInfo(path) {
    return Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders(),]).then((values) => {
      const rootFolders = values[1];
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
    });
  }

  markStatus(path, status, progress) {
    Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders(),]).then((values) => {
      const rootFolders = values[1];
      while (path.startsWith("/")) {
        path = path.substring(1);
      }

      const parts = path.split("/");
      const rootFolderName = parts.shift();
      if (rootFolderName == "Playlist") {
        return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
          data: JSON.stringify({
            show: "playlist",
            season: parts[0],
            episode: parts[1],
            status: status,
            progress: progress,
          }),
          type: "POST",
          contentType: "application/json",
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
            return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
              data: JSON.stringify({
                show: "collection",
                season: parts[0],
                episode: parts[1],
                status: status,
                progress: progress,
              }),
              type: "POST",
              contentType: "application/json",
            });
          } else if (!folder.type || folder.type.toLowerCase() === "movie") {
            return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
              data: JSON.stringify({
                show: "movie",
                season: null,
                episode: path,
                status: status,
                progress: progress,
              }),
              type: "POST",
              contentType: "application/json",
            });
          }
        }

      }
    });
  }

  markEpisodeStatus(show, season, episode, status, progress) {
    return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
      data: JSON.stringify({
        show: show,
        season: season,
        episode: episode,
        status: status,
        progress: progress,
      }),
      type: "POST",
      contentType: "application/json",
    });
  }
}

module.exports = ShowProgressProvider;
