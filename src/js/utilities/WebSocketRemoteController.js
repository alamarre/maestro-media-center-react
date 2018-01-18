class WebSocketRemoteController {
  constructor(host, clientName, webSocketPort) {
      const protocol = (webSocketPort == 443) ? "wss" : "ws";
      this.webSocketUrl = `${protocol}://${host}:${webSocketPort}`;
      this.clientName = clientName;
      this.updateFunctions = {};
  }

  updateSettings(host, clientName, webSocketPort) {
    const protocol = (webSocketPort == 443) ? "wss" : "ws";
    this.webSocketUrl = `${protocol}://${host}:${webSocketPort}`;
    this.clientName = clientName;
    this.guid = clientName;
  }

  updateClientName(clientName) {
    this.clientName = clientName;
    if(this.webSocket) {
      this.webSocket.send(JSON.stringify({
        "action" : "setId",
        id : this.clientName
      }));
    }
  }

  mapUpdateFunctions(functions) {
    this.updateFunctions = functions;
  }

  getShortFolderName(folder) {
    var parentFolder = this.getParentFolder(folder);
    var shortFolderName = folder.substring(parentFolder.length + 1);
    return shortFolderName;
  }

  getParentFolder(folder) {
    var parentFolder = folder.substring(0, folder.lastIndexOf("/"));
    return parentFolder;
  }

  safeRun(func) {
    if(func) {
      func();
    }
  }

  connect() {
    var self = this;
    if(!this.webSocketUrl) {
      return;
    }
    this.webSocket = new WebSocket(this.webSocketUrl);
    var ws = this.webSocket;
    ws.onopen = () => {
      if(self.clientName) {
      ws.send(JSON.stringify({
          "action" : "setId",
          id : self.clientName
        }));
      }
    };
    
    ws.onclose = () => {
      self.connect();
    };
    ws.onmessage = (evt) => {
      var received_msg = evt.data;
      var message = JSON.parse(received_msg);
      console.log(message);
      if (message && message.action) {
        switch (message.action) {
        case "playNext":
          this.safeRun(self.updateFunctions.next);
          break;
        case "playPrevious":
          this.safeRun(self.updateFunctions.previous);
          break;
        case "skipForward":
          this.safeRun(self.updateFunctions.skipForward);
          break;
        case "skipBack":
          this.safeRun(self.updateFunctions.skipBack);
          break;
        case "play":
          this.safeRun(self.updateFunctions.play);
          break;
        case "load":
          let event = new CustomEvent("maestro-load-video", {detail:message});
          
          document.dispatchEvent(event);
          break;
        case "pause":
          this.safeRun(self.updateFunctions.pause);
          break;
        case "seek":
          if(self.updateFunctions.seek) {
            self.updateFunctions.seek(parseInt(message.percent));
          }
          break;
        case "toggleVisibility":
          this.safeRun(self.updateFunctions.toggleVisibility);
          break;
        }
      }

    };
  }

  
}

module.exports = WebSocketRemoteController;