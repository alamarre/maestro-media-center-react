import React from 'react'

import { Link } from 'react-router'

class VideoPlayer extends React.Component {
  constructor(props) {
      super(props);
      this.state = {};
      if(this.props.remoteController) {
          this.props.remoteController.mapUpdateFunctions({
              setSource: this.setSourcePath.bind(this),
              next: this.goToNextEpisode.bind(this),
              previous: this.goToPreviousEpisode.bind(this)
          })
      }
  }

  render() {
      
    return (
        <div>
         <video style={{display: this.state.source != null ? 'block' : 'none' }} ref='video' data-source={this.state.source} controls autoPlay={true}>
            <source src={this.state.source} type="video/mp4" />
            </video>
        </div>
    )
  }

  setSourcePath(parentPath, subdirectory, index) {
    this.setState({"parentPath": parentPath, "subdirectory": subdirectory, "index": index});
    this.getEpisodes();
    this.getSeasons();
  }

  getEpisodes() {
    var self = this;
    this.setState({"parentFolders": null, "episodes": null});
    this.props.episodeLoader.getListingPromise(this.state.parentPath +"/" +this.state.subdirectory).then(function(listing) {
        self.setState({"episodes": listing.files});
        if(self.state.index == null) {
            self.state.index = listing.files.length -1;
        }
        self.updateSource();
    });
  }

  getSeasons() {
    var self = this;
    this.props.episodeLoader.getListingPromise(this.state.parentPath).then(function(listing) {
        self.setState({"parentFolders": listing.folders});
    });
  }

  updateSource() {
    this.setState({"source": this.props.episodeLoader.getRootPath() + this.state.parentPath+"/"+this.state.subdirectory+"/"+this.state.episodes[this.state.index]});
    this.refs.video.load();
  }

  goToNextEpisode() {
    if(this.state.episodes == null) {
        return;
    }

    var index = this.state.index;
    var episodes = this.state.episodes;

    index++;
    if(index < this.state.episodes.length) {
        this.setState({"index": index});
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
        this.setState({"index": index});
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