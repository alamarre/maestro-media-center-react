class NewMoviesProvider {
  constructor(apiRequester) {
    this.apiRequester = apiRequester;
  }

  async getNewMovies() {
    return await this.apiRequester.apiRequestPromise("videos", "recent", {});
  }

}

module.exports = NewMoviesProvider;