import React from "react";
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from "@material-ui/core";

import INavigation from "../../utilities/providers/navigation/INavigation";
import CollectionsManager from "../../utilities/CollectionsManager";
import KeepWatching from "../../models/KeepWatchingData";
import Scrollable from "../ScrollableComponent";

export interface CollectionPickerProps {
  navOrder?: number;
  navigation: INavigation;
  showProgressProvider: any;
  videoLoader: any;
  cancelFunction: () => void;
  collectionName: string;
  metadataProvider: any;
  episodeLoader: any;
  collectionsManager: CollectionsManager;
}

export interface CollectionPickerState {
  collection: any;
  keepWatchingData?: KeepWatching;
  refs?: React.RefObject<HTMLButtonElement | HTMLInputElement | HTMLDivElement>[][];
}

export default class CollectionPicker extends React.Component<CollectionPickerProps, CollectionPickerState> {

  private cancelRef : React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  private keepWatchingRef : React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement>();
  private videoRefs : React.RefObject<HTMLButtonElement>[] = [];

  constructor(props) {
    super(props);
    this.state = { "collection": null };
    this.loadCollectionData();
  }

  async loadCollectionData() {
    const collectionInfo: any = await this.props.collectionsManager.getCollection(this.props.collectionName);
    const collection = collectionInfo.movies;
    let keepWatchingData = await this.props.showProgressProvider.getShowProgress("collection");
    const refs : React.RefObject<HTMLButtonElement | HTMLInputElement | HTMLDivElement>[][] = [];
    if (!keepWatchingData || keepWatchingData.season !== this.props.collectionName) {
      keepWatchingData = null;
    } else {
      refs.push([this.keepWatchingRef]);
    }

    this.videoRefs = collection.map(() => [React.createRef<HTMLButtonElement>()]);
    refs.push(this.videoRefs);
    refs.push([this.cancelRef]);

    this.setState({ collection, keepWatchingData, refs });
  }

  play(video) {
    const index = this.state.collection.indexOf(video);
    const folder = this.props.collectionName;
    this.props.videoLoader.loadVideo("collection", folder, index);
  }

  render() {
    if (!this.state.collection) {
      return <div></div>;
    }

    const videos = this.state.collection.map((video, i) => {
      return <div key={video}>
        <button ref={this.videoRefs[i][0]} className="maestroButton roundedButton fa fa-play" onClick={() => this.play(video)}></button>
        <span>{video}</span>
      </div>;

    });

    let keepWatchingView = null;
    if (this.state.keepWatchingData) {
      const index = this.state.keepWatchingData.episode;
      const video = this.state.collection[index];
      keepWatchingView = <div>
        <button ref={this.keepWatchingRef} className="maestroButton roundedButton fa fa-play c" onClick={() => this.play(video)}></button>
        <span>Keep watching: {video}</span>
      </div>;
    }

    const body = <div>
      <Dialog open={true} fullScreen={true} onClose={() => this.props.cancelFunction()}>

        <DialogTitle>
          {this.props.collectionName}
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


