class TvShowEpisodeProvider {
    constructor(apiRequester, cacheProvider, showProgressProvider) {
        this.apiRequester = apiRequester;
        this.cacheProvider = cacheProvider;
        this.showProgressProvider = showProgressProvider;
    }

    getListingPromise(folder) {
        var promise = new Promise((good, bad) => {
            Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders()]).then((values) => {
                let cache = values[0];
                let rootFolders = values[1];
                
                for(let folder of rootFolders) {
                    if(folder.type && folder.type.toLowerCase() === "tv") {
                        let rootFolder = cache.folders[folder.name];
                        if(rootFolder) {
                            for(let showName in rootFolder.folders) {
                                let doc = {
                                    path: folder.name + "/" + showName,
                                    title: showName,
                                    type: "tv"
                                }
                                
                                index.addDoc(doc);
                            }
                        }
                    } else {
                        // loop through all folders and add shows
                        addFilesInFolder(index, cache.folders[folder.name], folder.name);
                    }
                }
                s();
            }, f);
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

                result.files = result.files.sort(tvShowSort);

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