import React from "react";

import { Button, Dialog, DialogActions, DialogContent } from "@material-ui/core";

import MetadataImage from "../generic/MetadataImage";
import INavigation from "../../utilities/providers/navigation/INavigation";
import Scrollable from "../ScrollableComponent";
import MovieMetadata from "../../models/MovieMetadata";
import {PlayCircleOutline} from "@material-ui/icons";

export interface MoviePickerProps {
  navOrder?: number;
  navigation: INavigation;
  showProgressProvider: any;
  videoLoader: any;
  cancelFunction: () => void;
  movieName: string;
  metadataProvider: any;
  episodeLoader: any;
}

export interface MoviePickerState {
  movieInfo: MovieMetadata;
}

export default class MovieDetails extends React.Component<MoviePickerProps, MoviePickerState> {
  private cancelRef : React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  private playRef : React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  constructor(props) {
    super(props);

    this.state = { movieInfo: null };
    this.loadData();
  }

  async loadData() {
    const movieInfo = await this.props.metadataProvider.getMovieMetadata(this.props.movieName);
    this.setState({ movieInfo, }, () => {
      //this.focusCurrent();
    });
  }

  play() {
    this.props.videoLoader.loadVideo("movie", this.props.movieName, 0);
  }

  render() {
    if (!this.state.movieInfo) {
      return <div></div>;
    }

    const videoView = <div style={{ display: "table", }}>
      <div style={{ display: "table-cell", verticalAlign: "top", }}>
        <MetadataImage style={{ display: "inline", }} type="movies" width={150} height={225} name={this.props.movieName} ></MetadataImage>
      </div>
      <div style={{ display: "table-cell", verticalAlign: "top", }}>
        <div tabIndex={0} ref={this.playRef} className="nooutline" onClick={() => this.play()} >
          <PlayCircleOutline color="primary" ></PlayCircleOutline>
        </div>

        <span>{this.props.movieName} </span>
        <div style={{ padding: "20px", }}>{this.state.movieInfo.overview}</div>
      </div>
    </div>;

    const body = <div>
      <Dialog open={true} fullScreen={true} onClose={() => this.props.cancelFunction()}>
        <DialogContent>
          {videoView}
        </DialogContent>

        <DialogActions>
          <div tabIndex={0} className="maestroLabelButton" onClick={() => this.props.cancelFunction() } ref={this.cancelRef} >
            <Button variant="contained" color="secondary"> Cancel </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>;
    //const parentRefs = () => this.refs;
    return <div><Scrollable isDialog={true} refs={[[this.playRef], [this.cancelRef]]} navigation={this.props.navigation}>{body}</Scrollable></div>

  }
}


