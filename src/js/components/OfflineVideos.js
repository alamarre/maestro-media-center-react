const React = require("react");

class OfflineVideos extends React.Component {

  constructor(props) {
    super(props);
    this.state = { videos: [], };
    props.offlineStorage.getVideoList().then(videos => {
      this.setState({ videos, });
    });
  }

  play(item) {
    this.props.videoLoader.loadVideo(item.type, item.folder, item.index);
  }

  delete(item) {
    this.props.offlineStorage.delete(item.url);
    this.props.offlineStorage.getVideoList().then(videos => {
      this.setState({ videos, });
    });
  }

  render() {
    if (this.state.videos.length === 0) {
      return <div></div>;
    }

    const body = this.state.videos.map(item => {
      const imageSource = item.type === "tv" ?
        `${this.props.imageRoot}/50x75/tv/show/${item.showName}.jpg` :
        item.type === "collection" ?
          `${this.props.imageRoot}?collectionName=${item.name}` :
          `${this.props.imageRoot}/50x75/movies/${item.name}.jpg`;
      return <li key={item.name} className="list-group-item">
        <span onClick={() => this.play(item)} >
          <img style={{ border: "white 1px solid", marginRight: "10px", }} src={imageSource} width="50px" height="75px" />
          {item.name}
        </span>
        <button style={{ backgroundColor: "transparent", color: "white", border: "none", }} className="fa fa-trash" onClick={() => this.delete(item)}></button>
      </li>;

    });

    return (
      <div>{body}</div>
    );
  }
}

module.exports = OfflineVideos;
