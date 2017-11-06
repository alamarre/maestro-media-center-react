module.exports = class VideoLoader {
    constructor(remoteController) {
        this.remoteController = remoteController;
    }

    setRouter(router) {
        this.router = router;
    }

    loadVideo(type, folder, index) {
        if(this.remoteController.hasClient()) {
            this.remoteController.load(type, folder, index);
            this.router.push("/remote");
        } else {
            let url = `/view?type=${type}&index=${index}&folder=${encodeURIComponent(folder)}`;
            this.router.push(url);
        }
    }
}