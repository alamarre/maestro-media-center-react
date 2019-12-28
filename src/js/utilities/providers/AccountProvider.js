export default class AccountProvider {
  constructor(apiRequester) {
    this.apiRequester = apiRequester;
  }

  async getAccountId() {
    return await this.apiRequester.apiRequestPromise("account", "", {});
  }
}

