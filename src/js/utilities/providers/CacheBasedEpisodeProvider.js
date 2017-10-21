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
                let folders = folder.split("/");
                for(let i=0; i< folders.length; i++) {
                    current = current.folders[folder];
                }
                
                let result = {};
                result.folders = Object.keys(current.folders);
                result.files = Object.keys(current.files);
                
                result.files = result.files.filter((file) => {
                    return file.indexOf(".mp4") == (file.length-".mp4".length);
                });

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

module.exports = CacheBasedEpisodeProvider;