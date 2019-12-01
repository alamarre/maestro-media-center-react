class HomepageCollectionManager {
  constructor(apiRequester) {
    this.apiRequester = apiRequester;
  }

  async getCollections() {
    return await this.apiRequester.apiRequestPromise("homepage_collections", "", {});
  }

  async getAllCollections() {
    const collectionNames = await this.getCollections();
    return await Promise.all(collectionNames.map(async collection => {
      const collectionData = await this.getCollection(collection.name);
      return {
        name: collection.name,
        items: collectionData,
      };
    }));
  }

  async getCollection(collection) {
    return await this.apiRequester.apiRequestPromise("homepage_collections", collection, {});
  }
}

module.exports = HomepageCollectionManager;
