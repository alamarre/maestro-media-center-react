import ApiCaller from "./ApiCaller";
import ICacheProvider from "./ICacheProvider";
import Playlist from "../../models/Playlist";

export default class PlaylistProvider {
  constructor(private apiCaller: ApiCaller, private cacheProvider: ICacheProvider) {
  }

  async getPlaylists() {
    return await this.apiCaller.get<Playlist[]>("playlists", "");
  }

  async getPlaylist(playlist) {
    const result = (await this.getPlaylists()).filter(p => p.name === playlist);
    if (result.length === 0) {
      return null;
    }

    if (typeof result[0].playlist === "string") {
      result[0].playlist = JSON.parse(result[0].playlist);
    }
    return result[0];
  }
}


