import VideoPlayInformation from "../../../models/VideoPlayInformation";

export default interface IPlayerManager {
  load(parentPath: string, subdirectory: string, index: number): Promise<VideoPlayInformation>;
  reload(): Promise<VideoPlayInformation>;
  updateSource(): Promise<VideoPlayInformation>;
  recordProgress(time: undefined): Promise<void>;
  goToNext(): Promise<VideoPlayInformation>;
  goToPrevious(): Promise<VideoPlayInformation>;
}
