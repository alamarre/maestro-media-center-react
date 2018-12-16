import React from 'react'
import ShowPicker from "./ShowPicker"
const CollectionPicker = require("./pickers/CollectionStartPicker");
const PlaylistPicker = require("./pickers/PlaylistPicker");
const MoviePicker = require("./pickers/MovieDetails");

class SearchResults extends React.Component {

  constructor(props) {
    super(props);
    this.state = { "searchResults": [] };
  }

  search(value) {
    if (!value || value == "") {
      this.setState({ "searchResults": [] });
    }
    this.props.searcher.getResults(value).then(results => {
      this.setState({ "searchResults": results });
    });
  }

  selectSource(item) {
    if (item.type == "playlist") {
      this.setState({ playlistName: item.name });
      return;
    }
    Promise.all([this.props.cacheProvider.isTvShow(item.path), this.props.cacheProvider.getCacheFromPath(item.path)])
      .then(values => {
        let isTvShow = values[0];
        let cachePath = values[1];
        if (isTvShow) {
          this.setState({ showName: item.name, showPath: item.path, cachePath: cachePath })
        } else if (item.type === "collection") {
          //this.props.videoLoader.loadVideo("collection", item.name, 0);
          this.setState({ collectionName: item.name })
        } else {
          this.setState({movieName: item.name});
         // this.props.videoLoader.loadVideo(item.type, item.name, 0);
        }
      })
  }

  cancelShowChooser() {
    this.setState({ "showName": null, "collectionName": null, "playlistName": null, movieName: null });
  }

  render() {
    let searchResults = this.state.searchResults.map(item => {
      const imageSource = item.type === "tv" ?
        `${this.props.imageRoot}/50x75/tv/show/${item.name}.jpg` :
        item.type === "collection" ?
          `${this.props.imageRoot}/50x75/collections/${item.name}.jpg` :
          `${this.props.imageRoot}/50x75/movies/${item.name}.jpg`;
      return <li className="list-group-item" key={item.path} onClick={evt => this.selectSource(item)}>
        <img style={{ border: "white 1px solid", marginRight: "10px" }} src={imageSource} width="50px" height="75px" />
        {item.name}
      </li>
    });

    searchResults = <ul style={{ position: "absolute" }} className="list-group">{searchResults}</ul>;
    let showPicker = null;
    if (this.state.showName) {
      showPicker = <ShowPicker
        router={this.props.router}
        episodeLoader={this.props.episodeLoader}
        offlineStorage={this.props.offlineStorage}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        showPath={this.state.showPath}
        showName={this.state.showName}
        cancelFunction={this.cancelShowChooser.bind(this)}
        showCache={this.state.cachePath}>
      </ShowPicker>
    } else if (this.state.collectionName) {
      showPicker = <CollectionPicker
        router={this.props.router}
        episodeLoader={this.props.episodeLoader}
        offlineStorage={this.props.offlineStorage}
        videoLoader={this.props.videoLoader}
        collectionsManager={this.props.collectionsManager}
        showProgressProvider={this.props.showProgressProvider}
        collectionName={this.state.collectionName}
        cancelFunction={this.cancelShowChooser.bind(this)}>
      </CollectionPicker>;
    } else if (this.state.playlistName) {
      showPicker = <PlaylistPicker
        router={this.props.router}
        episodeLoader={this.props.episodeLoader}
        offlineStorage={this.props.offlineStorage}
        videoLoader={this.props.videoLoader}
        playlistManager={this.props.playlistManager}
        showProgressProvider={this.props.showProgressProvider}
        playlistName={this.state.playlistName}
        cancelFunction={this.cancelShowChooser.bind(this)}>
      </PlaylistPicker>;
    } else if (this.state.movieName) {
      showPicker = <MoviePicker
        router={this.props.router}
        episodeLoader={this.props.episodeLoader}
        offlineStorage={this.props.offlineStorage}
        videoLoader={this.props.videoLoader}
        playlistManager={this.props.playlistManager}
        showProgressProvider={this.props.showProgressProvider}
        metadataProvider={this.props.metadataProvider}
        movieName={this.state.movieName}
        cancelFunction={this.cancelShowChooser.bind(this)}>
      </MoviePicker>;
    }
    var body = <div>
      <div>
        <label>Search:</label><input type="text" onChange={evt => this.search(evt.target.value)} />
      </div>
      {searchResults}
      {showPicker}
    </div>;


    return (
      <div>{body}</div>
    )
  }
}

export default SearchResults;
