import ApiCaller from "./ApiCaller";
import IEpisodeProvider from "./IEpisodeProvider";
import VideoSourceInformation from "../../models/VideoSourceInformation";

export default class EpisodeProvider implements IEpisodeProvider {
  constructor(private apiCaller: ApiCaller) {
  }

  async getListingPromise(folder: string) : Promise<any> {
    const result : any = await this.apiCaller.get(`folders?path=${folder}`, "");
    result.files = result.files.sort(window["tvShowSort"])
    return result;
  }

  getRootPath() : string {
    return this.apiCaller.getHost()+"/videos";
  }

  async getVideoSource(path): Promise<VideoSourceInformation> {

    const result = await this.apiCaller.get<VideoSourceInformation>("folders", `sources?path=${encodeURIComponent(path)}`);

    return result;
  }

}

