import AuthTokenManager from "./AuthTokenManager";

export default class WebSocketSender {
  private webSocketUrl: string;
  private webSocket: any;
  private devices: string[];
  private client: string;
  constructor(host, webSocketPort, private authTokenManager: AuthTokenManager) {
    const protocol = (webSocketPort == 443) ? "wss" : "ws";
    const portString = (webSocketPort == 80 || webSocketPort == 443) ? "" : `:${webSocketPort}`;
    this.webSocketUrl = `${protocol}://${host}${portString}`;
    this.authTokenManager = authTokenManager;
    this.devices = [];
  }

  updateSettings(host, webSocketPort) {
    const protocol = (webSocketPort == 443) ? "wss" : "ws";
    const portString = (webSocketPort == 80 || webSocketPort == 443) ? "" : `:${webSocketPort}`;
    this.webSocketUrl = `${protocol}://${host}${portString}`;
  }

  getDevices() {
    return this.devices;
  }

  connect() {
    if (!this.webSocketUrl) {
      return;
    }
    this.webSocket = new WebSocket(this.webSocketUrl);
    var ws = this.webSocket;
    ws.onopen = () => {
      ws.send(JSON.stringify({
        "action": "list",
        "keepUpdating": true,
        token: this.authTokenManager.getToken(),
      }));
    };

    ws.onclose = () => {
      this.connect();
    };
    ws.onmessage = (evt) => {
      var received_msg = evt.data;
      var message = JSON.parse(received_msg);
      if (message.action == "list") {
        this.devices = message.ids;
        const event = new CustomEvent("maestro-remote-client-list-updated", { detail: message, });
        document.dispatchEvent(event);
      }
    };
  }

  hasClient() {
    return this.client && this.client != "";
  }

  setClient(client) {
    this.client = client;
  }

  playNext() {
    this.sendMessage({
      "action": "playNext",
    });
  }

  playPrevious() {
    this.sendMessage({
      "action": "playPrevious",
    });
  }

  skipForward() {
    this.sendMessage({
      "action": "skipForward",
    });
  }

  skipBack() {
    this.sendMessage({
      "action": "skipBack",
    });
  }

  play() {
    this.sendMessage({
      "action": "play",
    });
  }

  toggleVisibility() {
    this.sendMessage({
      "action": "toggleVisibility",
    });
  }

  load(type, folder, index) {
    this.sendMessage({
      "action": "load",
      "type": type,
      folder: folder,
      index: index,
      token: this.authTokenManager.getToken(),
      profile: this.authTokenManager.getProfile(),
    });
  }

  pause() {
    this.sendMessage({
      "action": "pause",
    });
  }

  seek(percent) {
    this.sendMessage({
      "action": "seek",
      "percent": percent,
    });
  }

  sendMessage(message) {
    message.client = this.client;
    message.token = this.authTokenManager.getToken();
    this.webSocket.send(JSON.stringify(message));
  }
}

