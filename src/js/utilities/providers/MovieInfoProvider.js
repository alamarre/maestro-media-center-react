import normalizedMatch from "../NormalizedMatch";

export default class MovieInfoProvider {

  constructor(cacheProvider) {
    this.cacheProvider = cacheProvider;
  }

  async getMoviePathByName(movieName) {
    const [cache, rootFolders,] = await Promise.all([this.cacheProvider.getCache(), this.cacheProvider.getRootFolders(),]);
    for (const rootFolder of rootFolders) {
      if (!rootFolder.type || rootFolder.type.toLowerCase() === "movie") {
        const path = await this.findInFolder(cache.folders[rootFolder.name], rootFolder.name, movieName);
        if (path) {
          return path;
        }
      }
    }
  }

  async findInFolder(folder, path, filename) {
    for (const file in folder.files) {
      if (normalizedMatch(file, filename)) {
        return path + "/" + file;
      }
    }

    for (const f in folder.folders) {
      const result = await this.findInFolder(folder.folders[f], path + "/" + f, filename);
      if (result) {
        return result;
      }
    }
  }
}


