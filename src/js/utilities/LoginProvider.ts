import ApiCaller from "./providers/ApiCaller";
import Token from "../models/Token";

export default class LoginProvider {
  private apiCaller: ApiCaller;
  constructor(apiCaller) {
    this.apiCaller = apiCaller;
  }

  async loginPromise(username, password): Promise<string> {
    const body = {
      username: username,
      password: password,
    };
    const result = await this.apiCaller.post<Token>("login", "", body);

    return result.token;
  }

}

