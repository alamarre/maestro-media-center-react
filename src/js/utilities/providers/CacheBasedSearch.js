let elasticlunr = require("elasticlunr");

function addFilesInFolder(index, currentCache, path) {
    if(currentCache && currentCache.files) {
        let fileNames = Object.keys(currentCache.files).sort(tvShowSort).filter((f) => {
            return f.endsWith(".mp4");
        });
        let episodeCount = 0;
        for(let file of fileNames) {
            let filePath = path + "/" + file;
            let doc = {
                path: filePath,
                type: "movie",
                index: episodeCount++,
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
                    this.addField('index');
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
                                    type: "tv",
                                    index: 0
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
                        index: doc.index,
                        name: item.ref.substring(item.ref.lastIndexOf("/")+1)
                    };
                })

                results = results.sort((a,b) => {
                    return tvShowSort(a.name, b.name);
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
                    let doc = this.cacheIndex.documentStore.getDoc(item.ref);
                    return {
                        path: item.ref,
                        index: doc.index,
                        name: item.ref.substring(item.ref.lastIndexOf("/")+1)
                    };
                })
                success(results);
            }, fail);
        });
    }   
}

module.exports = CacheBasedSearch;