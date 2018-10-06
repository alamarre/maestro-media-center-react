class MovieCollectionManager {
  constructor(rootFolder, collectionsManager, episodeLoader, showProgressProvider) {
    this.rootFolder = rootFolder;
    this.collectionsManager = collectionsManager;
    this.episodeLoader = episodeLoader;
    this.showProgressProvider = showProgressProvider;
  }

  async load(parentPath, subdirectory, index) {
    this.collection = parentPath;
    this.index = index;
    this.movies = (await this.collectionsManager.getCollection(parentPath)).movies;
    return await this.updateSource();
  }

  async updateSource() {
    const name = this.movies[this.index];
    let seekTime = 0;
    const progress = await this.showProgressProvider.getShowProgress("collection");
    if (progress && progress.episode == this.index && progress.season == this.collection) {
      seekTime = progress.progress || 0;
    } else {
      this.showProgressProvider.markStatus(this.rootFolder + "/" + this.collection + "/" + this.index, "started", 0);
    }

    const path = this.collection;
    const source = this.episodeLoader.getRootPath() + "/" + await this.collectionsManager.getPath(name);
    return { source, name, seekTime, path, index: this.index, };
  }

  recordProgress(time) {
    this.showProgressProvider.markStatus(this.rootFolder + "/" + this.collection + "/" + this.index, "in progress", time);
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

module.exports = MovieCollectionManager;
