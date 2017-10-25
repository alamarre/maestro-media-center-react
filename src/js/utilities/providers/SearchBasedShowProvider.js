class SearchBasedShowProvider {
    constructor(apiRequester, cacheProvider, showProgressProvider, searchProvider) {
        this.apiRequester = apiRequester;
        this.cacheProvider = cacheProvider;
        this.showProgressProvider = showProgressProvider;
        this.searchProvider = searchProvider;
    }

    getListingPromise(folder) {
        var promise = new Promise((good, bad) => {
            if(!folder || folder === "") {
                good({files: [], folders: ["TV Shows", "Movies"]});
            } else {
                let type = (folder == "Movies" || folder == "/Movies") ? "movie" : "tv";
                
                this.searchProvider.getByType(type).then((results) => {
                    good({folders:[], files: results});
                }, bad);

            }
        });

        return promise;
    }
    
    recordProgress(video, status) {
        this.cacheProvider.getRootFolders().then((rootFolders) => {
           if(video.startsWith("/")) {
               video = video.substring(1);
           }
           
           let parts = video.split("/");
           let rootFolder = rootFolders[parts[0]];
           if(rootFolder 
               && rootFolder.type 
               && rootFolder.type.toLowerCase() === "tv"
               && parts.length === 4) {
               let show = parts[1];
               let season = parts[2];
               let episode = parts[3];
               
               this.showProgressProvider.markEpisodeStatus(show, season, episode, status);
           }
           
        });
    }

    getRootPath() {
        return this.apiRequester.getHost()+"/videos"
    }

}

module.exports = SearchBasedShowProvider;