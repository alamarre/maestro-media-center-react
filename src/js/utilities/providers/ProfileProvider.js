class ProfileProvider {
    constructor(apiRequester) {
        this.apiRequester = apiRequester;
    }

    getProfiles() {
        return this.apiRequester.apiRequestPromise("profiles", "", {
            type: "GET"
        });
    }

    createProfile(profileName, isChild) {
        return this.apiRequester.apiRequestPromise("profiles", "", {
            data: JSON.stringify({
                profileName: profileName,
                isChild: isChild
            }),
            type: "POST",
            contentType: "application/json"
        });
    }

}

export default ProfileProvider;