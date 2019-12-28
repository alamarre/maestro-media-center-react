const imageRoot = process.env.IMAGE_ROOT || "https://maestro-images.omny.ca";

export default class MetadataProvider {
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

  async getAccountId() {
    return await this.apiRequester.apiRequestPromise("account", "", {});
  }

  async getMoviePoster(movieName, width, height) {
    const accountId = await this.getAccountId();
    return `${imageRoot}/${accountId}/${width}x${height}/movies/${movieName}.jpg`;
  }

  async getTvShowPoster(show, width, height) {
    const accountId = await this.getAccountId();
    return `${imageRoot}/${accountId}/${width}x${height}/tv/show/${show}.jpg`;
  }

  async getTvEpisodePoster(show, season, episode, width, height) {
    const accountId = await this.getAccountId();
    return `${imageRoot}/${accountId}/${width}x${height}/tv/episode/${show}/${season}/${episode}.jpg`;
  }

}

