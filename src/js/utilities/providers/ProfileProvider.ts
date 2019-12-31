import ApiCaller from "./ApiCaller";
import Profile from "../../models/Profile";
export default class ProfileProvider {
  constructor(private apiCaller: ApiCaller) {
  }

  async getProfiles(): Promise<Profile[]> {
    return await this.apiCaller.get("profiles", "");
  }

  async createProfile(profileName, isChild): Promise<void> {
    return await this.apiCaller.post("profiles", "", {
      profileName,
      isChild,
    });
  }

}

