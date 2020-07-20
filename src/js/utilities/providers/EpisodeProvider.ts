import ApiCaller from "./ApiCaller";
import IEpisodeProvider from "./IEpisodeProvider";
import VideoSourceInformation from "../../models/VideoSourceInformation";
import Server from "../../models/Server";

function timeoutPromise(ms, promise): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("promise timeout"));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}

export default class EpisodeProvider implements IEpisodeProvider {
  private serverPromise: Promise<Server[]>;
  constructor(private apiCaller: ApiCaller) {
    this.serverPromise = this.updateServers();
  }

  async updateServers(): Promise<Server[]> {
    const result = this.getAvailableServers();
    this.serverPromise = result;
    //setTimeout(() => this.updateServers(), 30000);
    return await result;
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

  async getServers(): Promise<Server[]> {
    return await this.apiCaller.get<Server[]>("servers", "");
  }

  async getAvailableServers(): Promise<Server[]> {
    const servers = await this.getServers();
    const availableServers: Server[] = [];

    for (const server of servers) {
      try {
        const result = await timeoutPromise(3000, fetch((server.scheme || "http") + "://" + server.ip + ":" + server.port + "/health"));
        const body = await result.json();
        if (body.clientIp) {
          availableServers.push(server);
        }
      }
      catch (e) {
        //
      }

    }
    return availableServers;
  }

  async getAvailableLocalSource(source): Promise<string> {
    const url = new URL(source);
    const servers = await this.serverPromise;
    const matching = servers.filter(s => s.publicHostname === url.hostname);
    if (matching.length === 1) {
      const server = matching[0];
      const resultUrl = (server.scheme || "http") + "://" + server.ip + ":" + server.port + url.pathname + url.search;
      return resultUrl;
    }

    return null;
  }

}

