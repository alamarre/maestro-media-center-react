import ApiCaller from "./ApiCaller";
export default class ProfileProvider {
  constructor(private apiCaller: ApiCaller) {
  }

  async getProfiles() {
    return await this.apiCaller.get("profiles", "");
  }

  async createProfile(profileName, isChild) {
    return await this.apiCaller.post("profiles", "", {
      profileName,
      isChild,
    });
  }

}

