let elasticlunr = require("elasticlunr");

function addFilesInFolder(index, currentCache, path) {
    if(currentCache && currentCache.files) {
        for(let file in currentCache.files) {
            path += "/" + file;
            let doc = {
                path: path,
                type: "movie",
                title: file.substring(0, file.lastIndexOf("."))
            }
            
            index.addDoc(doc);
        }
    }
    
    if(currentCache.folders) {
        for(let folder in currentCache.folders) {
            addFilesInFolder(index, currentCache.folders[folder], path + "/" +folder);
        }
    }
}

class CacheBasedSearch {
    constructor(cacheProvider) {
        this.cacheProvider = cacheProvider;
        this.cacheIndex = null;
        this.indexPromise = null;

        this.createIndex();
    }

    createIndex() {
        this.indexPromise = new Promise((s, f) => {
            Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders()]).then((values) => {
                let cache = values[0];
                let rootFolders = values[1];
                let index = elasticlunr(function () {
                    this.addField('title');
                    this.addField('type');
                    this.setRef('path');
                }); 
                
                this.cacheIndex = index;

                elasticlunr.clearStopWords();
                
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
        });
    }

    getTvShows() {
        return this.getByType("tv");
    }

    getMovies() {
        return this.getByType("movie");
    }

    getByType(contentType) {
        return new Promise((success, fail) => {
            this.indexPromise.then(() => {
                let result = this.cacheIndex.search(contentType,  {
                    fields: {
                        type: {boost: 2}
                    },
                    expand: true
                });
                
                let results = result.map((item) => {
                    let doc = this.cacheIndex.documentStore.getDoc(item.ref);
                    return {
                        type: doc.type,
                        path: item.ref,
                        name: item.ref.substring(item.ref.lastIndexOf("/")+1)
                    };
                })
                success(results);
            }, fail);
        });
    }
    
    getResults(value) {
        return new Promise((success, fail) => {
            this.indexPromise.then(() => {
                let result = this.cacheIndex.search(value,  {
                    fields: {
                        title: {boost: 2}
                    },
                    expand: true
                });
                let results = result.map((item) => {
                    return {
                        path: item.ref,
                        name: item.ref.substring(item.ref.lastIndexOf("/")+1)
                    };
                })
                success(results);
            }, fail);
        });
    }   
}

module.exports = CacheBasedSearch;