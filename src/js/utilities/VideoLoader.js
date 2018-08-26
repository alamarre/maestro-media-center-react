module.exports = class VideoLoader {
  constructor(remoteController) {
    this.remoteController = remoteController;
  }

  setRouter(router) {
    this.router = router;
  }

  loadVideo(type, folder, index) {
    if(this.remoteController && this.remoteController.hasClient()) {
      this.remoteController.load(type, folder, index);
      this.router.push("/remote");
    } else {
      this.setUrl(type, folder, index, true);
    }
  }

  setUrl(type, folder, index, addToHistory) {
    const url = `/view?type=${type}&index=${index}&folder=${encodeURIComponent(folder)}`;
    if(addToHistory) {
      this.router.push(url);
    } else {
      this.router.replace(url);
    }
  }
};