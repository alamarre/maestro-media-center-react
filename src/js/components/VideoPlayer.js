import React from 'react'

import { Link } from 'react-router'

class VideoPlayer extends React.Component {
  constructor(props) {
      super(props);
      let episodeLoader = this.props.episodeLoader;
      
      this.episodeLoader = episodeLoader;
      this.type = this.props.location.query.type;
      this.preventIdleTimer = null;
      this.state={"overlayVisibility": false};
      this.progressTimer = null;
      if(this.props.remoteController) {
          this.props.remoteController.mapUpdateFunctions({
              setSource: this.setSourcePath.bind(this),
              next: this.goToNextEpisode.bind(this),
              previous: this.goToPreviousEpisode.bind(this),
              play: this.play.bind(this),
              pause: this.pause.bind(this),
              skipForward: this.skipForward.bind(this),
              skipBack: this.skipBack.bind(this),
              toggleVisibility: this.toggleVisibility.bind(this),
              seek: this.seek.bind(this)
          })
      }  
  }

  componentWillMount() {
    
  }

  componentDidMount() {
    this.props.videoLoader.setRouter(this.props.router);
    if(this.props.location.query.folder) {
        var path = this.props.location.query.folder;
        var parentPath = path.substring(0, path.lastIndexOf('/'));
        var subdirectory = path.substring(path.lastIndexOf('/')+1);
        
        this.setSourcePath(parentPath, subdirectory, this.props.location.query.index);
    }

    document.addEventListener("maestro-load-video", (event) => {
        event = event.detail;
        var path = event.folder;
        var parentPath = path.substring(0, path.lastIndexOf('/'));
        var subdirectory = path.substring(path.lastIndexOf('/')+1);
        this.type = event.type;
        this.setSourcePath(parentPath, subdirectory, event.index);
    });

      if(this.props.isChromecast) {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();
        player.addEventListener(cast.framework.events.EventType.PLAY,
            event => {
                this.hideEpisodeInfo();
                this.onPlay();
            });

        player.addEventListener(cast.framework.events.EventType.PAUSE,
            event => {
                this.showEpisodeInfo();
                this.onPause();
            });

            player.addEventListener(cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
                event => {
                    const textTracksManager = player.getTextTracksManager();

                    // Create track 1 for English text
                    const track = textTracksManager.createTrack();
                    track.trackContentType = 'text/vtt';
                    track.trackContentId = `${this.state.source.replace('.mp4', '.vtt')}`;
                    track.language = 'en';

                    // Add tracks
                    textTracksManager.addTracks([track]);

                    // Set the first matching language text track to be active
                    textTracksManager.setActiveByLanguage('en');
                });

        player.addEventListener(cast.framework.events.EventType.ENDED,
            event => {
                this.goToNextEpisode();
            });


        //player.setMediaElement(this.refs.video);
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

    let overlayStyle = {
        position: "absolute",
        left: 0,
        center: 0,
        right: 0,
        top: 0,
        backgroundColor: "black",
        width: "100%",
        height: "100%",
        zIndex: 10000,
    }

    let overlay = null;
    if(this.state.overlayVisibility) {
        overlay = <div style={overlayStyle}></div>;
    }

    if(this.state.showEpisodeInfo) {
        currentEpisodeStyle["opacity"] = 1;
    }
    let videoSource = null;
    const subtitles = this.state.source && this.state.source.replace('.mp4', '.vtt');
    if(!this.props.isChromecast) {
        videoSource = <video crossOrigin="anonymous" onEnded={this.goToNextEpisode.bind(this)} onPlay={this.onPlay.bind(this)} onPause={this.onPause.bind(this)} style={{margin: 0, padding: 0, left: 0, top: 0, width: "100%", height: "100%", position: "absolute", background: "#000", display: this.state.source != null ? 'block' : 'none'}} ref='video' data-source={this.state.source} controls={!this.isChromecast} autoPlay={true}>
        <source src={this.state.source} type="video/mp4" />
        <track src={subtitles} kind="subtitles" srclang="en" label="English" default />
     </video>;
    }
    return (
        <div>
         {videoSource}
         <div style={currentEpisodeStyle} ref="episodeInfo">{this.state.episodeInfo}</div>
         {overlay}
        </div>
    )
  }

  toggleVisibility() {
      this.setState({"overlayVisibility": !this.state.overlayVisibility});
  }

  setSourcePath(parentPath, subdirectory, index) {
    this.setState({"parentPath": parentPath, "subdirectory": subdirectory, "index": index}, () => {
        this.getEpisodes();
        this.getSeasons();
    });
  }

  getEpisodes() {
    var self = this;
    if(this.state.episodes) {
        this.setState({"episodes": null});
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
        listing.folders.sort(tvShowSort);
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
    if(this.props.isChromecast) {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();
        var mediaInfo = new  cast.framework.messages.MediaInformation();
        
        //mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        //mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
        //mediaInfo.metadata.title = ;
        
        mediaInfo.contentId = source;
        mediaInfo.contentType = "video/mp4";
        let request = new cast.framework.messages.LoadRequestData();
        request.media = mediaInfo;
        request.autoplay = true;

        player.load(request);
    } else {
        this.refs.video.load();
    }

    this.props.showProgressProvider.getShowInfo(parentPath + "/"+this.state.subdirectory+"/"+ episode).then(showInfo => {
        if(showInfo && showInfo.show) {
            this.props.showProgressProvider.getShowProgress(showInfo.show).then(progress => {
                if(progress && progress.episode == showInfo.episode && progress.season == showInfo.season) {
                    this.seekToTime(progress.progress);
                } else {
                    this.props.showProgressProvider.markStatus(parentPath + "/"+this.state.subdirectory+"/"+ episode, "started", 0);
                }
            });
        }
    });

    this.props.videoLoader.setUrl(this.type, parentPath + "/"+this.state.subdirectory, this.state.index);
  }

  onPause() {
    this.showEpisodeInfo();
    if(this.preventingIdle) {
        this.preventingIdle = false;
        if(this.props.isChromecast) {
            const context = cast.framework.CastReceiverContext.getInstance();
            const player = context.getPlayerManager();
            player.seek(this.currentTime);
            return;
        }
    
        this.refs.video.currentTime = this.currentTime;
    }
    else if(!this.preventIdleTimer) {
        // this unfortunately doesn't stop the chromecast but keeping for posterity
        return;
        this.preventIdleTimer = setInterval(() => {
            this.preventingIdle = true;
            let time = 0;
            if(this.props.isChromecast) {
                const context = cast.framework.CastReceiverContext.getInstance();
                const player = context.getPlayerManager();
                time = player.getCurrentTimeSec() - 2;
            } else {
                time = this.refs.video.currentTime;
            }
            this.currentTime = time; 
            this.play();
        }, 10*60*1000);
    }
  }

  onPlay() {
    if(!this.progressTimer) {
        this.progressTimer = setInterval(() => {
            let parentPath = this.state.parentPath.startsWith("/") ? this.state.parentPath : "/" +this.state.parentPath;
            let episode = this.state.episodes[this.state.index];
            this.props.showProgressProvider.markStatus(parentPath + "/"+this.state.subdirectory+"/"+ episode, "in progress", this.getCurrentTime());
        }, 10*1000);
    }
    this.hideEpisodeInfo();
    if(this.preventIdleTimer && !this.preventingIdle) {
        clearInterval(this.preventIdleTimer);
    }

    if(this.preventingIdle) {
        setTimeout(this.pause.bind(this), 1000);
    }
  }

  pause() {
    if(this.props.isChromecast) {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();
        player.pause();
        return;
    }

    this.refs.video.pause();
  }

  play() {
    if(this.props.isChromecast) {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();
        player.play();
        return;
    }

    this.refs.video.play();
  }

  skipForward() {
    if(this.props.isChromecast) {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();
        player.seek(player.getCurrentTimeSec()+15);
        return;
    }

    this.refs.video.currentTime += 15;
  }

  skipBack(time) {
    time = time || 15;
    if(this.props.isChromecast) {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();
        let seekTime = player.getCurrentTimeSec()-time;
        player.seek(seekTime >= 0 ? seekTime : 0);
        return;
    }

    this.refs.video.currentTime -= time;
  }

  seekToTime(time) {
    if(this.props.isChromecast) {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();
        player.seek(time);
        return;
    }

    this.refs.video.currentTime = time;
  }

  getCurrentTime() {
    if(this.props.isChromecast) {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();
        return player.getCurrentTimeSec();
    }
    
    return this.refs.video.currentTime;
  }

  seek(percent) {
    if(this.props.isChromecast) {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();
        player.seek((player.getDurationSec() * percent) / 100);
        return;
    }

      this.refs.video.currentTime = (this.refs.video.duration * percent) / 100;
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
                this.setState({"subdirectory": this.state.parentFolders[i +1], "index": 0}, () => {
                    this.getEpisodes();
                });
                break;
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
    if(index >= 0) {
        this.setState({"index": index}, () => this.updateSource());
    } else {
        for(var i=0; i + 1< this.state.parentFolders.length; i++) {
            if(this.state.parentFolders[i + 1]== this.state.subdirectory) {
                this.setState({"subdirectory": this.state.parentFolders[i], "index": null}, () => {
                    this.getEpisodes();
                });
                
                break;
            }
        }
    }
  }
}

module.exports = VideoPlayer
