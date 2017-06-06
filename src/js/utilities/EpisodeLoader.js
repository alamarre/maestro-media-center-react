class EpisodeLoader {
    constructor(apiRequester) {
        this.apiRequester = apiRequester;
    }

    getListingPromise(folder) {
        var self = this;
        var promise = new Promise(function(good, bad) {
            self.apiRequester.apiRequestPromise("folders", "", {
                data: {
                    path: folder
                }
            }).then(function(result) {
                result.files = result.files.filter(function(file) {
                    return file.indexOf(".mp4") == (file.length-".mp4".length);
                });

                good(result);
            }, function(error) {
                bad(error);
            });
        });

        return promise;
    }

    getRootPath() {
        return this.apiRequester.getHost()+"/videos"
    }

}

module.exports = EpisodeLoader;