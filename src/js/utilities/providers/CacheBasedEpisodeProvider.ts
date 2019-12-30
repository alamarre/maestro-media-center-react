import ApiCaller from "./ApiCaller";
import Server from "../../models/Server";
import VideoSourceInformation from "../../models/VideoSourceInformation";
import ICacheProvider from "./ICacheProvider";

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

export default class CacheBasedEpisodeProvider {
  private serverPromise: Promise<Server[]>;
  constructor(
    private apiCaller: ApiCaller, private cacheProvider: ICacheProvider, private showProgressProvider) {
    this.serverPromise = this.updateServers();
  }

  async updateServers(): Promise<Server[]> {
    const result = this.getAvailableServers();
    this.serverPromise = result;
    setTimeout(() => this.updateServers(), 30000);
    return await result;
  }

  getRootPath(): string {
    return this.apiCaller.getHost() + "/videos";
  }

  getListingPromise(folder): Promise<any> {
    var promise = new Promise((good, bad) => {
      this.cacheProvider.getCache()
        .then((cache) => {
          let current = cache;
          if (folder.startsWith("/")) {
            folder = folder.substring(1);
          }
          const folders = folder.split("/");
          for (let i = 0; i < folders.length; i++) {
            if (folders[i]) {
              current = current.folders[folders[i]];
            }
          }

          const result = { folders: {}, files: [], };
          result.folders = Object.keys(current.folders);
          result.files = Object.keys(current.files);

          result.files = result.files.sort(window["tvShowSort"]);

          good(result);
        }, bad);
    });

    return promise;
  }

  async recordProgress(video, status): Promise<void> {
    this.cacheProvider.getRootFolders().then((rootFolders) => {
      if (video.startsWith("/")) {
        video = video.substring(1);
      }

      const parts = video.split("/");
      const rootFolder = rootFolders[parts[0]];
      if (rootFolder
        && rootFolder.type
        && rootFolder.type.toLowerCase() === "tv"
        && parts.length === 4) {
        const show = parts[1];
        const season = parts[2];
        const episode = parts[3];

        this.showProgressProvider.markEpisodeStatus(show, season, episode, status);
      }

    });
  }

  async getVideoSource(path): Promise<VideoSourceInformation> {
    return await this.apiCaller.get("folders", `sources?path=${encodeURIComponent(path)}`);
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


