class NewMoviesProvider {
  constructor(apiRequester, cacheProvider) {
    this.apiRequester = apiRequester;
    this.cacheProvider = cacheProvider;
  }

  async getNewMovies() {
    const cache = await this.cacheProvider.getCache();

    const result = await this.apiRequester.apiRequestPromise("videos", "recent", {});
    const cachedMovies = Object.keys(cache.folders["Movies"].files);
    return result.filter(m => cachedMovies.includes(m.movie));
  }

}

module.exports = NewMoviesProvider;