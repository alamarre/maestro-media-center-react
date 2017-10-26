class WebSocketRemoteController {
  constructor(host, clientName, webSocketPort) {
      this.webSocketUrl = "ws://" + host +":"+webSocketPort;
      this.clientName = clientName;
      this.updateFunctions = {};
  }

  updateSettings(host, clientName, webSocketPort) {
    this.webSocketUrl = "ws://" + host +":"+webSocketPort
    this.clientName = clientName;
    this.guid = clientName;
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
    ws.onopen = function () {
		ws.send(JSON.stringify({
			  "action" : "setId",
				id : self.clientName
			}));
    };
    
    ws.onclose = function () {
      self.connect();
    };
    ws.onmessage = function (evt) {
      var received_msg = evt.data;
      var message = JSON.parse(received_msg);
      console.log(message);
      if (message && message.action) {
        switch (message.action) {
        case "playNext":
          safeRun(self.updateFunctions.next);
          break;
        case "playPrevious":
          safeRun(self.updateFunctions.previous);
          break;
        case "skipForward":
          safeRun(self.updateFunctions.skipForward);
          break;
        case "skipBack":
          safeRun(self.updateFunctions.skipBack);
          break;
        case "play":
          safeRun(self.updateFunctions.play);
          break;
        case "load":
          var parentDir = self.getParentFolder(message.folder);
          var subDir = self.getShortFolderName(message.folder);

          let event = new CustomEvent("maestro-load-video", {
            parentDir: parentDir,
            subDirectory: subDir,
            index: message.index
          })
          
          document.dispatchEvent(event);
          break;
        case "pause":
          safeRun(self.updateFunctions.pause);
          break;
        case "seek":
          seekPercent(parseInt(message.percent));
          break;
        case "toggleVisibility":
          $("#overlay").toggle();
          break;
        }
      }

    };
  }

  
}

module.exports = WebSocketRemoteController;