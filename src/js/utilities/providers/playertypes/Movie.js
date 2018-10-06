class MoviePlayerManager {
  constructor(episodeLoader, showProgressProvider) {
    this.episodeLoader = episodeLoader;
    this.showProgressProvider = showProgressProvider;
  }

  async load(parentPath, subdirectory, index, file) {
    this.parentPath = parentPath;
    this.subdirectory = subdirectory;
    this.index = index;
    this.file = file;
    return await this.updateSource();
  }

  async updateSource() {
    const parentPath = this.parentPath.startsWith("/") ? this.parentPath : "/" + this.parentPath;
    const listing = await this.episodeLoader.getListingPromise(this.parentPath + "/" + this.subdirectory);
    this.episodes = listing.files;
    const episode = this.episodes[this.index];
    let source = this.episodeLoader.getRootPath() + parentPath + "/" + this.subdirectory + "/" + episode;
    if (episode.path) {
      source = this.episodeLoader.getRootPath() + episode.path;
    }
    const name = this.episodes[this.index];

    let seekTime = 0;
    const showInfo = await this.showProgressProvider.getShowInfo(parentPath + "/" + this.subdirectory + "/" + episode);
    if (showInfo && showInfo.show) {
      const progress = await this.showProgressProvider.getShowProgress(showInfo.show);
      if (progress && progress.episode == showInfo.episode && progress.season == showInfo.season) {
        seekTime = progress.progress || 0;
      } else {
        this.showProgressProvider.markStatus(parentPath + "/" + this.subdirectory + "/" + episode, "started", 0);
      }
    }

    const path = parentPath + "/" + this.subdirectory;
    return { source, name, seekTime, path, index: this.index, };
  }

  recordProgress(time) {
    const parentPath = this.parentPath.startsWith("/") ? this.parentPath : "/" + this.parentPath;
    const episode = this.episodes[this.index];
    this.showProgressProvider.markStatus(parentPath + "/" + this.subdirectory + "/" + episode, "in progress", time);
  }

  async goToNext() {
    return null;
  }

  async goToPrevious() {
    return null;
  }

}

module.exports = MoviePlayerManager;
