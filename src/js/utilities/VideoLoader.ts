
export default class VideoLoader {
  private router;
  constructor(private remoteController) {
  }

  setRouter(router) {
    this.router = router;
  }

  loadVideo(type, folder, index, profile) {
    if (this.remoteController && this.remoteController.hasClient()) {
      this.remoteController.load(type, folder, index);
      this.router.push("/remote");
    } else {
      this.setUrl(type, folder, index, true, profile);
    }
  }

  setUrl(type, folder, index, addToHistory, profile) {
    if (!profile) {
      profile = "";
    }
    const url = `/view?type=${type}&index=${index}&profile=${profile}&folder=${encodeURIComponent(folder)}`;
    if (addToHistory) {
      this.router.push(url);
    } else {
      this.router.replace(url);
    }
  }
}
