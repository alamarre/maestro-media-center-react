class TvShowPlayerManager {
  constructor(episodeLoader, showProgressProvider) {
    this.episodeLoader = episodeLoader;
    this.showProgressProvider = showProgressProvider;
  }

  async load(parentPath, subdirectory, index) {
    this.parentPath = parentPath;
    this.subdirectory = subdirectory;
    this.index = index;
    this.getSeasons();
    return await this.getEpisodes();
  }

  async getEpisodes() {
    const listing = await this.episodeLoader.getListingPromise(this.parentPath + "/" + this.subdirectory);
    this.episodes = listing.files;
    if (this.index == null) {
      this.index = listing.files.length - 1;
    }
    return await this.updateSource();
  }

  async getSeasons() {
    const listing = await this.episodeLoader.getListingPromise(this.parentPath);
    listing.folders.sort(tvShowSort);
    this.parentFolders = listing.folders;
  }

  async updateSource() {
    const parentPath = this.parentPath.startsWith("/") ? this.parentPath : "/" + this.parentPath;
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
        seekTime = progress.progress;
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
    const index = this.index + 1;

    if (index < this.episodes.length) {
      this.index = index;
      return this.updateSource();
    } else {
      for (var i = 0; i + 1 < this.parentFolders.length; i++) {
        if (this.parentFolders[i] == this.subdirectory) {
          this.subdirectory = this.parentFolders[i + 1];
          this.index = 0;
          return await this.getEpisodes();
        }
      }
    }
  }

  async goToPrevious() {
    const index = this.index - 1;

    if (index >= 0) {
      this.index = index;
      return this.updateSource();
    } else {
      for (var i = 0; i + 1 < this.parentFolders.length; i++) {
        if (this.parentFolders[i + 1] == this.subdirectory) {
          this.subdirectory = this.parentFolders[i];
          this.index = null;
          return await this.getEpisodes();
        }
      }
    }
  }
}

module.exports = TvShowPlayerManager;