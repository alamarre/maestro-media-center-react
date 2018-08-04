class CacheProvider {
    constructor(apiRequester) {
        this.apiRequester = apiRequester;
        this.cachePromise = null;
        this.rootFoldersPromise = null;
        this.getCache().catch(() => {});
        this.getRootFolders().catch(() => {});
    }
    
    getCache() {
        if(!this.cachePromise) {
            this.cachePromise = this.apiRequester.apiRequestPromise("folders", "cache", {});
        }
        
        return this.cachePromise;
    } 

    reload() {
        this.cachePromise = this.apiRequester.apiRequestPromise("folders", "cache", {});
        this.rootFoldersPromise = this.apiRequester.apiRequestPromise("folders", "root", {});
    }

    isTvShow(path) {
        if(path.indexOf("/")==0) {
            path = path.substring(1);
        }

        return new Promise((s,f) => {
            this.getRootFolders().then((rootFolders) => {
                let parts = path.split("/");
                for(let rootFolder of rootFolders) {
                    if(rootFolder.name === parts[0]) {
                        s(rootFolder.type && rootFolder.type.toLowerCase() === "tv");
                        return;
                    }
                }
                f();
            }, f);
        })
    }

    async getShowPath(showName) {
        const cache = await this.getCache();
        const rootFolders = await this.getRootFolders();
        for(let folder of rootFolders) {
            if(folder.type && folder.type.toLowerCase() === "tv") {
                let rootFolder = cache.folders[folder.name];
                if(rootFolder.folders[showName]) {
                    return folder.name + "/" + showName;
                }
            }
        }
    }

    getCacheFromPath(path) {
        return new Promise((s,f) => {
            this.getCache().then(cache => {
                if(path.indexOf("/")==0) {
                    path = path.substring(1);
                }

                let parts = path.split("/");
                let current = cache;
                for(var i=0; i<parts.length; i++) {
                    current = current.folders[parts[i]];
                }

                if(current && current.folders  && current.folders.sort) {
                    current.folders = current.folders.sort(tvShowSort);
                }

                if(current && current.files  && current.files.sort) {
                    current.files = current.files.sort(tvShowSort);
                }

                s(current);
            }, f);
        });
    }
    
    getRootFolders() {
        if(!this.rootFoldersPromise) {
            this.rootFoldersPromise = this.apiRequester.apiRequestPromise("folders", "root", {});
        }
        
        return this.rootFoldersPromise;
    }
}

module.exports = CacheProvider;