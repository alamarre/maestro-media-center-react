import ApiCaller from "./ApiCaller";
import AccountInfo from "../../models/AccountInfo";
export default class AccountProvider {
  constructor(private apiCaller: ApiCaller) {
  }

  async getAccountId(): Promise<AccountInfo> {
    return await this.apiCaller.get<AccountInfo>("account", "");
  }
}

