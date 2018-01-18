class WebSocketSender {
    constructor(host, webSocketPort) {
        this.protocol = protocol;
        const protocol = (webSocketPort == 443) ? "wss" : "ws";
        this.webSocketUrl = `${protocol}://${host}:${webSocketPort}`;
        this.updateFunctions = {};
        this.devices = [];
    }
  
    updateSettings(host, webSocketPort) {
        const protocol = (webSocketPort == 443) ? "wss" : "ws";
        this.webSocketUrl = `${protocol}://${host}:${webSocketPort}`;
    }

    getDevices() {
        return this.devices;
    }

    connect() {
        if(!this.webSocketUrl) {
          return;
        }
        this.webSocket = new WebSocket(this.webSocketUrl);
        var ws = this.webSocket;
        ws.onopen =  () => {
          ws.send(JSON.stringify({
              "action" : "list",
              "keepUpdating": true
            }));
        };
        
        ws.onclose = () => {
          this.connect();
        };
        ws.onmessage = (evt) => {
          var received_msg = evt.data;
          var message = JSON.parse(received_msg);
          if(message.action == "list") {
              this.devices = message.ids;
              let event = new CustomEvent("maestro-remote-client-list-updated", {detail:message});
              document.dispatchEvent(event);
          }
        }
    }

    hasClient() {
        return this.client && this.client != "";
    }

    setClient(client) {
        this.client = client;
    }

    playNext() {
        this.sendMessage({
            "action": "playNext"
        })
    }

    playPrevious() {
        this.sendMessage({
            "action": "playPrevious"
        })
    }

    skipForward() {
        this.sendMessage({
            "action": "skipForward"
        })
    }

    skipBack() {
        this.sendMessage({
            "action": "skipBack"
        })
    }

    play() {
        this.sendMessage({
            "action": "play"
        })
    }

    toggleVisibility() {
        this.sendMessage({
            "action": "toggleVisibility"
        })
    }

    load(type, folder, index) {
        this.sendMessage({
            "action": "load",
            "type": type,
            folder: folder,
            index: index
        })
    }

    pause() {
        this.sendMessage({
            "action": "pause"
        })
    }

    seek(percent) {
        this.sendMessage({
            "action": "seek",
            "percent": percent
        })
    }

    sendMessage(message) {
        message.client = this.client;
        this.webSocket.send(JSON.stringify(message));
    }
}
  
  module.exports = WebSocketSender;