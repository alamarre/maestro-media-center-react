import ApiCaller from "./providers/ApiCaller";
export default class CollectionsManager {
  constructor(private apiCaller: ApiCaller, private movieInfoProvider) {
  }

  async getCollection(collection) {
    const result = await this.apiCaller.get("collections", collection);
    return result;
  }

  getPath(movieName) {
    return this.movieInfoProvider.getMoviePathByName(movieName);
  }
}


