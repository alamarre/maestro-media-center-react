class WebSocketRemoteController {
  constructor(host, clientName, webSocketPort) {
      this.webSocketUrl = "ws://" + host +":"+webSocketPort + "/events";
      this.clientName = clientName;
      this.guid = clientName;
      this.updateFunctions = {};
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

  connect() {
    var self = this;
    this.webSocket = new WebSocket(this.webSocketUrl);
    var ws = this.webSocket;
    ws.onopen = function () {
		ws.send(JSON.stringify({
				"action" : "setId",
				id : self.guid,
				host : self.clientName
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
          self.updateFunctions.next();
          break;
        case "playPrevious":
          self.updateFunctions.previous();
          break;
        case "skipForward":
          skipForward();
          break;
        case "skipBack":
          skipBack();
          break;
        case "play":
          if (typeof message.folder != "undefined") {
            var parentDir = self.getParentFolder(message.folder);
            var subDir = self.getShortFolderName(message.folder);
            self.updateFunctions.setSource(parentDir, subDir, message.index);
          } else {
            continueVideo();
          }
          break;
        case "pause":
          pauseVideo();
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