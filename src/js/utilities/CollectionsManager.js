export default class CollectionsManager {
  constructor(apiRequester, movieInfoProvider) {
    this.apiRequester = apiRequester;
    this.movieInfoProvider = movieInfoProvider;
  }

  async getCollection(collection) {
    const result = await this.apiRequester.apiRequestPromise("collections", collection, {});
    return result;
  }

  getPath(movieName) {
    return this.movieInfoProvider.getMoviePathByName(movieName);
  }
}


