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
    return result.length === 1 ? result[0] : null;
  }
}

module.exports = PlaylistProvider;
