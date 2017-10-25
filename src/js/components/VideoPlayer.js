import React from 'react'

import { Link } from 'react-router'

class VideoPlayer extends React.Component {
  constructor(props) {
      super(props);
      let episodeLoader = this.props.episodeLoader;
      
      this.episodeLoader = episodeLoader;
      this.type = this.props.location.query.type
      this.state={};
      if(this.props.remoteController) {
          this.props.remoteController.mapUpdateFunctions({
              setSource: this.setSourcePath.bind(this),
              next: this.goToNextEpisode.bind(this),
              previous: this.goToPreviousEpisode.bind(this),
              play: this.play.bind(this),
              pause: this.pause.bind(this)
          })
      }
      if(this.props.location.query.folder) {
        var path = this.props.location.query.folder;
        var parentPath = path.substring(0, path.lastIndexOf('/'));
        var subdirectory = path.substring(path.lastIndexOf('/')+1);
        
        this.setSourcePath(parentPath, subdirectory, this.props.location.query.index);
      }
  }

  render() {
      var currentEpisodeStyle = {
          position: "absolute",
        left: 100,
        right: 100,
        bottom: 20,
        fontSize: 36,
        color: "white",
        backgroundColor: "black",
        zIndex: 100,
        transition: "opacity 0.5s",
        opacity: 0
    }

    if(this.state.showEpisodeInfo) {
        currentEpisodeStyle["opacity"] = 1;
    }
    return (
        <div>
         <video onEnded={this.goToNextEpisode.bind(this)} onPlay={this.hideEpisodeInfo.bind(this)} onPause={this.showEpisodeInfo.bind(this)} style={{margin: 0, padding: 0, left: 0, top: 0, width: "100%", height: "100%", position: "absolute", background: "#000", display: this.state.source != null ? 'block' : 'none'}} ref='video' data-source={this.state.source} controls autoPlay={true}>
            <source src={this.state.source} type="video/mp4" />
         </video>
         <div style={currentEpisodeStyle} ref="episodeInfo">{this.state.episodeInfo}</div>
        </div>
    )
  }

  setSourcePath(parentPath, subdirectory, index) {
    this.state = {"parentPath": parentPath, "subdirectory": subdirectory, "index": index};
    this.getEpisodes();
    this.getSeasons();
  }

  getEpisodes() {
    var self = this;
    if(this.state.episodes) {
        this.setState({"parentFolders": null, "episodes": null});
    }
    this.episodeLoader.getListingPromise(this.state.parentPath +"/" +this.state.subdirectory).then(function(listing) {
        self.setState({"episodes": listing.files});
        if(self.state.index == null) {
            self.state.index = listing.files.length -1;
        }
        self.updateSource();
    });
  }

  getSeasons() {
    var self = this;
    this.episodeLoader.getListingPromise(this.state.parentPath).then(function(listing) {
        self.setState({"parentFolders": listing.folders});
    });
  }

  updateSource() {
    let parentPath = this.state.parentPath.startsWith("/") ? this.state.parentPath : "/" +this.state.parentPath;
    let episode = this.state.episodes[this.state.index];
    let source = this.episodeLoader.getRootPath() + parentPath + "/"+this.state.subdirectory+"/"+ episode;
    if(episode.path) {
        source = this.episodeLoader.getRootPath() + episode.path;
    }
    this.setState({
        "source": source,
        "episodeInfo": this.state.episodes[this.state.index]
    });
    this.refs.video.load();

    if(this.props.chromecastManager.isConnected()) {
        this.props.chromecastManager.playVideo(source, parentPath + "/"+this.state.subdirectory, this.state.index, this.type);
    }

    this.props.showProgressProvider.markStatus(parentPath + "/"+this.state.subdirectory+"/"+ episode, "started");
  }

  pause() {
    this.refs.video.pause();
  }

  play() {
    this.refs.video.play();
  }

  showEpisodeInfo() {
    this.setState({"showEpisodeInfo": true});
  }

  hideEpisodeInfo() {
    this.setState({"showEpisodeInfo": false});
  }

  goToNextEpisode() {
    if(this.state.episodes == null) {
        return;
    }

    var index = this.state.index;
    var episodes = this.state.episodes;

    index++;
    if(index < this.state.episodes.length) {
        this.setState({"index": index}, () => this.updateSource());
    } else {
        for(var i=0; i + 1< this.state.parentFolders.length; i++) {
            if(this.state.parentFolders[i]== this.state.subdirectory) {
                this.setState({"subdirectory": this.state.parentFolders[i +1], "index": 1});
                this.getEpisodes();
            }
        }
    }
  }

  goToPreviousEpisode() {
    if(this.state.episodes == null) {
        return;
    }

    var index = this.state.index;
    var episodes = this.state.episodes;

    index--;
    if(index > 0) {
        this.setState({"index": index}, () => this.updateSource());
    } else {
        for(var i=0; i + 1< this.state.parentFolders.length; i++) {
            if(this.state.parentFolders[i + 1]== this.state.subdirectory) {
                this.setState({"subdirectory": this.state.parentFolders[i], "index": null});
                this.getEpisodes();
            }
        }
    }
  }
}

module.exports = VideoPlayer
