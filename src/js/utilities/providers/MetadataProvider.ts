import ApiCaller from "./ApiCaller";
const imageRoot = process.env.IMAGE_ROOT || "https://maestro-images.omny.ca";

export default class MetadataProvider {
  constructor(private apiCaller: ApiCaller) {
  }

  async getMovieMetadata(movie) {
    return await this.apiCaller.get("metadata", `movie/${movie}`);
  }

  async getTvShowMetaData(show) {
    return await this.apiCaller.get("metadata", `tv/${show}`);
  }

  async getTvSeasonMetaData(show, season) {
    return await this.apiCaller.get("metadata", `tv/${show}/${season}`);
  }

  async getTvEpisodeMetaData(show, season, episode) {
    return await this.apiCaller.get("metadata", `tv/${show}/${season}/${episode}`);
  }

  async getAccountId() {
    return await this.apiCaller.get("account", "");
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

