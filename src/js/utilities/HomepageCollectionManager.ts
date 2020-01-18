import ApiCaller from "./providers/ApiCaller";
import HomepageCollection from "../models/HomepageCollection";
export default class HomepageCollectionManager {
  constructor(private apiCaller: ApiCaller) {
  }

  async getCollections(): Promise<HomepageCollection[]> {
    return await this.apiCaller.get<HomepageCollection[]>("homepage_collections", "");
  }

  async getAllCollections() {
    const collectionNames = await this.getCollections();
    return await Promise.all(collectionNames.map(async collection => {
      const collectionData = await this.getCollection(collection.name);
      return Object.assign({
        items: collectionData,
      }, collection);
    }));
  }

  async getCollection(collection) {
    return await this.apiCaller.get<HomepageCollection>("homepage_collections", collection);
  }
}


