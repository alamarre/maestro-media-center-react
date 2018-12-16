class MoviePlayerManager {
  constructor(episodeLoader, showProgressProvider) {
    this.episodeLoader = episodeLoader;
    this.showProgressProvider = showProgressProvider;
  }

  async load(parentPath, subdirectory, index, file) {
    this.movieName = parentPath;
    this.index = index;
    this.file = file;
    return await this.updateSource();
  }

  async updateSource() {
    const sourceInfo = await this.episodeLoader.getVideoSource("Movies/" + this.movieName);
    const {sources, subtitles,} =  sourceInfo;
    const name = this.movieName;

    let seekTime = 0;
    const showInfo = await this.showProgressProvider.getShowInfo("Movies/" + name);
    if (showInfo && showInfo.show) {
      const progress = await this.showProgressProvider.getShowProgress(showInfo.show);
      if (progress && progress.episode == showInfo.episode && progress.season == showInfo.season) {
        seekTime = progress.progress || 0;
      } else {
        this.showProgressProvider.markStatus("Movies/" + name, "started", 0);
      }
    }

    const path = "Movies";
    return { sources, subtitles, name, seekTime, path, index: this.index, };
  }

  recordProgress(time) {
    this.showProgressProvider.markStatus("Movies/" + this.movieName, "in progress", time);
  }

  async goToNext() {
    return null;
  }

  async goToPrevious() {
    return null;
  }

}

module.exports = MoviePlayerManager;
