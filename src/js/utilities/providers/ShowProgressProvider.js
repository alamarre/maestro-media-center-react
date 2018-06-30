class ShowProgressProvider {
    constructor(apiRequester, cacheProvider) {
        this.apiRequester = apiRequester;
        this.cacheProvider = cacheProvider;
    }

    getShowsInProgress() {
        return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
            type: "GET"
        });
    }

    getShowProgress(showName) {
        return this.getShowsInProgress().then(shows => {
            for(let show of shows) {
                if(show.show === showName) {
                    return show;
                }
            }
            return null;
        });
    }

    getShowInfo(path) {
        return Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders()]).then((values) => {
            let cache = values[0];
            let rootFolders = values[1];
            while(path.startsWith("/")) {
                path = path.substring(1);
            }

            let parts = path.split("/");
            let rootFolderName = parts.shift();
            for(let folder of rootFolders) {
                if(folder.name == rootFolderName ) {
                    if(parts.length == 3 && folder.type && folder.type.toLowerCase() === "tv") {
                        let show = parts[0];
                        let season = parts[1];
                        let episode = parts[2];

                        return {show, season, episode};
                    } else if(!folder.type || folder.type.toLowerCase() !== "tv") {
                        return {show: "movie", episode: path};
                    }
                }
            }
            return null;
        });
    }

    markStatus(path, status, progress) {
        Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders()]).then((values) => {
            let cache = values[0];
            let rootFolders = values[1];
            while(path.startsWith("/")) {
                path = path.substring(1);
            }

            let parts = path.split("/");
            let rootFolderName = parts.shift();
            for(let folder of rootFolders) {
                if(folder.name == rootFolderName ) {
                    if(parts.length == 3 && folder.type && folder.type.toLowerCase() === "tv") {
                        let show = parts[0];
                        let season = parts[1];
                        let episode = parts[2];

                        this.markEpisodeStatus(show, season, episode, status, progress);
                    } else if(!folder.type || folder.type.toLowerCase() !== "tv") {
                        return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
                            data: JSON.stringify({
                                show: "movie",
                                season: null,
                                episode: path,
                                status: status,
                                progress: progress
                            }),
                            type: "POST",
                            contentType: "application/json"
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
                progress: progress
            }),
            type: "POST",
            contentType: "application/json"
        });
    }
}

module.exports = ShowProgressProvider;