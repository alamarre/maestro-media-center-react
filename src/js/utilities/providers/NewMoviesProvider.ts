import ApiCaller from "./ApiCaller";
import ICacheProvider from "./ICacheProvider";
import NewMovie from "../../models/NewMovie";

export default class NewMoviesProvider {
  constructor(private apiCaller: ApiCaller, private cacheProvider: ICacheProvider) {
  }

  async getNewMovies() {
    const cache = await this.cacheProvider.getCache();

    const result = await this.apiCaller.get<NewMovie[]>("videos", "recent");
    const cachedMovies = Object.keys(cache.folders["Movies"].files);
    return result.filter(m => cachedMovies.includes(m.movie));
  }

}

