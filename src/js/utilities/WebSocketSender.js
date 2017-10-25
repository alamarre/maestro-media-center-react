class WebSocketSender {
    constructor(host, webSocketPort) {
        this.webSocketUrl = "ws://" + host +":"+webSocketPort + "/events";
        this.updateFunctions = {};
    }
  
    updateSettings(host, webSocketPort) {
      this.webSocketUrl = "ws://" + host +":"+webSocketPort + "/events"
    }

    setClient(client) {
        this.client = client;
    }

    playNext() {
        this.sendMessage(, {
            "action": "playNext"
        })
    }

    playPrevious() {
        this.sendMessage(client, {
            "action": "playPrevious"
        })
    }

    skipForward() {
        this.sendMessage(client, {
            "action": "skipForward"
        })
    }

    skipBack() {
        this.sendMessage({
            "action": "skipBack"
        })
    }

    play() {
        this.sendMessage(client, {
            "action": "skipBack"
        })
    }

    pause() {
        this.sendMessage(client, {
            "action": "skipBack"
        })
    }

    seek() {
        this.sendMessage({
            "action": "skipBack"
        })
    }

    sendMessage(client, message) {
        message.client = this.client;
        this.webSocket.send(JSON.stringify(message));
    }
  
    connect() {
      var self = this;
      if(!this.webSocketUrl) {
        return;
      }
      this.webSocket = new WebSocket(this.webSocketUrl);
      var ws = this.webSocket;
      
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
            if (typeof message.folder != "undefined") {
              var parentDir = self.getParentFolder(message.folder);
              var subDir = self.getShortFolderName(message.folder);
              if(self.updateFunctions.setSource) {
                self.updateFunctions.setSource(parentDir, subDir, message.index);
              }
            } else {
              safeRun(self.updateFunctions.play);
            }
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
  
  module.exports = WebSocketSender;