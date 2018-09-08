class PlaylistManager {
  constructor(rootFolder, playlistManager, episodeLoader, showProgressProvider) {
    this.rootFolder = rootFolder;
    this.playlistManager = playlistManager;
    this.episodeLoader = episodeLoader;
    this.showProgressProvider = showProgressProvider;
  }

  async load(parentPath, subdirectory, index) {
    this.playlist = parentPath;
    this.index = index;
    this.movies = (await this.playlistManager.getPlaylist(parentPath)).playlist;
    return await this.updateSource();
  }

  async updateSource() {
    const video = this.movies[this.index];
    let seekTime = 0;
    const progress = await this.showProgressProvider.getShowProgress("playlist");
    if (progress && progress.episode == this.index && progress.season == this.playlist) {
      seekTime = progress.progress;
    } else {
      this.showProgressProvider.markStatus(this.rootFolder + "/" + this.playlist + "/" + this.index, "started", 0);
    }
    const name = video.file;
    const path = this.playlist;
    const source = this.episodeLoader.getRootPath() + "/" + video.path;
    return { source, name, seekTime, path, index: this.index, };
  }

  recordProgress(time) {
    this.showProgressProvider.markStatus(this.rootFolder + "/" + this.playlist + "/" + this.index, "in progress", time);
  }

  async goToNext() {
    const index = this.index + 1;

    if (index < this.movies.length) {
      this.index = index;
      return this.updateSource();
    }
  }

  async goToPrevious() {
    const index = this.index - 1;

    if (index >= 0) {
      this.index = index;
      return this.updateSource();
    }
  }

}

module.exports = PlaylistManager;
