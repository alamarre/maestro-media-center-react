const imageRoot = process.env.IMAGE_ROOT || "https://video-images.omny.ca";

class MetadataProvider {
  constructor(apiRequester) {
    this.apiRequester = apiRequester;
  }

  async getMovieMetadata(movie) {
    return await this.apiRequester.apiRequestPromise("metadata", `movie/${movie}`, {});
  }

  async getTvShowMetaData(show) {
    return await this.apiRequester.apiRequestPromise("metadata", `tv/${show}`, {});
  }

  async getTvSeasonMetaData(show, season) {
    return await this.apiRequester.apiRequestPromise("metadata", `tv/${show}/${season}`, {});
  }

  async getTvEpisodeMetaData(show, season, episode) {
    return await this.apiRequester.apiRequestPromise("metadata", `tv/${show}/${season}/${episode}`, {});
  }

  async getMoviePoster(movieName, width, height) {
    return `${imageRoot}/${width}x${height}/movies/${movieName}.jpg`;
  }

  async getTvShowPoster(show, width, height) {
    return `${imageRoot}/${width}x${height}/tv/show/${show}.jpg`;
  }

  async getTvEpisodePoster(show, season, episode, width, height) {
    return `${imageRoot}/${width}x${height}/tv/episode/${show}/${season}/${episode}.jpg`;
  }

}

module.exports = MetadataProvider;