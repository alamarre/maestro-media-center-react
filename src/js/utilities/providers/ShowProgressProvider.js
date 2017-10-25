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

    markStatus(path, status) {
        Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders()]).then((values) => {
            let cache = values[0];
            let rootFolders = values[1];
            if(path.startsWith("/")) {
                path = path.substring(1);
            }

            let parts = path.split("/");
            let rootFolderName = parts.shift();
            for(let folder of rootFolders) {
                if(folder.name == rootFolderName && folder.type && folder.type.toLowerCase() === "tv") {
                    if(parts.length == 3) {
                        let show = parts[0];
                        let season = parts[1];
                        let episode = parts[2];

                        this.markEpisodeStatus(show, season, episode, status);
                    }
                }
            }
        });
    } 

    markEpisodeStatus(show, season, episode, status) {
        return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
            data: JSON.stringify({
                show: show,
                season: season,
                episode: episode,
                status: status
            }),
            type: "POST",
            contentType: "application/json"
        });
    }
}

module.exports = ShowProgressProvider;