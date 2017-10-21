let elasticlunr = require("elasticlunr");

function addFilesInFolder(index, currentCache, path) {
    if(currentCache && currentCache.files) {
        for(let file in currentCache.files) {
            path += "/" + file;
            let doc = {
                path: path,
                title: file.substring(file.lastIndexOf("."))
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
        this.createIndex();
        
    }

    createIndex() {
        Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders()], (values) => {
            let cache = values[0];
            let rootFolders = values[1];
            this.cacheIndex = elasticlunr(function () {
                this.addField('title');
                this.setRef('path');
            }); 
            
            
            for(let folder of rootFolders) {
                if(folder.type.toLowerCase() === "tv") {
                    let rootFolder = cache[folder.name];
                    if(rootFolder) {
                        for(let showName in rootFolder.folders) {
                            let doc = {
                                path: folder.name + "/" + showName,
                                title: showName
                            }
                            
                            index.addDoc(doc);
                        }
                    }
                } else {
                    // loop through all folders and add shows
                    addFilesInFolder(index, cache[folder.name], "");
                }
            }
        });
    }
    
    

    
}

module.exports = CacheBasedSearch;