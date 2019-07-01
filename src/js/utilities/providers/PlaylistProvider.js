class PlaylistProvider {
  constructor(apiRequester, cacheProvider) {
    this.apiRequester = apiRequester;
    this.cacheProvider = cacheProvider;
  }

  async getPlaylists() {
    return await this.apiRequester.apiRequestPromise("playlists", "", {});
  }

  async getPlaylist(playlist) {
    const result = (await this.getPlaylists()).filter(p => p.name === playlist);
    if(result.length === 0) {
      return null;
    }

    if(typeof result[0].playlist === "string") {
      result[0].playlist = JSON.parse(result[0].playlist);
    }
    return result[0];
  }
}

module.exports = PlaylistProvider;
