import ApiCaller from "./ApiCaller";
export default class AccountProvider {
  constructor(private apiCaller: ApiCaller) {
  }

  async getAccountId() {
    return await this.apiCaller.get("account", "");
  }
}

