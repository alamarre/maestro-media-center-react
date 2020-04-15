import IPlayerManager from "./IPlayerManager";
import IEpisodeProvider from "../IEpisodeProvider";

export default class MoviePlayerManager implements IPlayerManager {

  private movieName: string;
  private index: number;

  constructor(private episodeLoader: IEpisodeProvider, private showProgressProvider) {
    this.episodeLoader = episodeLoader;
    this.showProgressProvider = showProgressProvider;
  }

  async load(parentPath, subdirectory, index) {
    this.movieName = parentPath;
    this.index = index;
    return await this.updateSource();
  }

  async reload() {
    const result = await this.updateSource();
    result.seekTime = 0;
    return result;
  }

  async updateSource() {
    const sourceInfo = await this.episodeLoader.getVideoSource("Movies/" + this.movieName);
    const { sources, subtitles, } = sourceInfo;
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

  async recordProgress(time) {
    this.showProgressProvider.markStatus("Movies/" + this.movieName, "in progress", time);
  }

  async goToNext() {
    return {};
  }

  async goToPrevious() {
    return null;
  }

}


