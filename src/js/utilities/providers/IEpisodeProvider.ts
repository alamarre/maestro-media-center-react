import VideoSourceInformation from "../../models/VideoSourceInformation";
export default interface IEpisodeProvider {
  getListingPromise(folder: string): Promise<any>;
  getRootPath(): string;
  getVideoSource(path): Promise<VideoSourceInformation>;
}
