class CacheProvider {
    constructor(apiRequester) {
        this.apiRequester = apiRequester;
        this.cachePromise = null;
        this.rootFoldersPromise = null;
        this.getCache();
        this.getRootFolders();
    }
    
    getCache() {
        if(!this.cachePromise) {
            this.cachePromise = this.apiRequester.apiRequestPromise("folders", "cache", {});
        }
        
        return this.cachePromise;
    }
    
    getRootFolders() {
        if(!this.rootFoldersPromise) {
            this.rootFoldersPromise = this.apiRequester.apiRequestPromise("folders", "root", {});
        }
        
        return this.rootFoldersPromise;
    }
}

module.exports = CacheProvider;