import React from "react";
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from "@material-ui/core";
import INavigation from "../../utilities/providers/navigation/INavigation";
import Scrollable from "../ScrollableComponent";
import KeepWatching from "../../models/KeepWatchingData";
import PlaylistEntry from "../../models/PlaylistEntry";

export interface PlaylistPickerProps {
  navOrder?: number;
  navigation: INavigation;
  playlistManager: any;
  showProgressProvider: any;
  videoLoader: any;
  cancelFunction: () => void;
  playlistName: string;
  metadataProvider: any;
  episodeLoader: any;
}

export interface PlaylistPickerState {
  refs?: React.RefObject<HTMLButtonElement | HTMLInputElement | HTMLDivElement>[][];
  keepWatchingData: KeepWatching;
  playlist: PlaylistEntry[];
}

export default class PlaylistPicker extends React.Component<PlaylistPickerProps, PlaylistPickerState> {

  private cancelRef : React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  private keepWatchingRef : React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement>();
  private videoRefs : React.RefObject<HTMLButtonElement>[][] = [];

  constructor(props) {
    super(props, []);
    this.state = Object.assign({ "playlist": null, }, this.state);
    this.loadPlaylistData();
  }

  async loadPlaylistData() {
    const playlistInfo = await this.props.playlistManager.getPlaylist(this.props.playlistName);
    const playlist: PlaylistEntry[] = playlistInfo.playlist;
    let keepWatchingData = await this.props.showProgressProvider.getShowProgress("playlist");

    let refs : React.RefObject<HTMLButtonElement | HTMLInputElement | HTMLDivElement>[][] = [];
    if (!keepWatchingData || keepWatchingData.season !== this.props.playlistName) {
      keepWatchingData = null;
    } else {
      refs.push([this.keepWatchingRef]);
    }

    this.videoRefs = playlist.map(() => [React.createRef<HTMLButtonElement>()]);

    refs= refs.concat(this.videoRefs);
    refs.push([this.cancelRef])
    this.setState({ playlist, keepWatchingData, refs, }, () => {
      //this.focusCurrent();
    });
  }

  play(video) {
    const index = this.state.playlist.indexOf(video);
    const folder = this.props.playlistName;
    this.props.videoLoader.loadVideo("playlist", folder, index);
  }

  render() {
    if (!this.state.playlist) {
      return <div></div>;
    }

    const videos = this.state.playlist.map((video, index) => {
      const ref = this.videoRefs[index][0];
      return <div key={index}>
        <button ref={ref} className="maestroButton roundedButton fa fa-play" onClick={() => this.play(video)}></button>
        <span>{video.file}</span>
      </div>;

    });

    let keepWatchingView = null;
    if (this.state.keepWatchingData) {
      const index = this.state.keepWatchingData.episode;
      const video = this.state.playlist[index];
      keepWatchingView = <div>
        <button ref={this.keepWatchingRef} className="maestroButton roundedButton fa fa-play c" onClick={() => this.play(video)}></button>
        <span>Keep watching: {video.file}</span>
      </div>;
    }

    const body = <div>
      <Dialog open={true} fullScreen={true} onClose={() => this.props.cancelFunction()}>

        <DialogTitle>
          {this.props.playlistName}
        </DialogTitle>

        <DialogContent>
          {keepWatchingView}
          <hr style={{ backgroundColor: "white", }} ></hr>
          {videos}
        </DialogContent>

        <DialogActions>
          <div tabIndex={0} className="maestroLabelButton" onClick={() => this.props.cancelFunction() } ref={this.cancelRef} >
            <Button variant="contained" color="secondary"> Cancel </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>;

    return (
      <div><Scrollable isDialog={true} navigation={this.props.navigation} refs={this.state.refs} >{body}</Scrollable></div >
    );
  }
}


