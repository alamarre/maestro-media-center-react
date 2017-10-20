class ShowProgressProvider {
    constructor(apiRequester) {
        this.apiRequester = apiRequester;
    }

    getShowsInProgress() {
        return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
            type: "GET"
        });
    }

    markEpisodeStatus(show, season, episode, status) {
        return this.apiRequester.apiRequestPromise("shows", "keep-watching", {
            data: JSON.stringify({
                show: show,
                season: season,
                episode: episode,
                status: status
            }),
            type: "POST",
            contentType: "application/json"
        });
    }
}

export default ShowProgressProvider;