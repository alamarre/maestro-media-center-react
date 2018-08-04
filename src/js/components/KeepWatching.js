import React from 'react'

import ShowPicker from "./ShowPicker"

function lastWatchedSort(a, b) {
    return (a.lastUpdated || 0) - (b.lastUpdated || 0);
}

class KeepWatching extends React.Component {
  constructor(props) {
      super(props);
      this.state = {root: "", videos: []};
      props.showProgressProvider.getShowsInProgress().then(videos => {
        this.setState({videos:videos.filter(v => v.show !== "movie").sort(lastWatchedSort)});
      });
  }

  componentDidMount() {
    
  }

  async play(video) {
      const showPath = await this.props.cacheProvider.getShowPath(video.show);
      const showName = video.show;
      const cachePath = await this.props.cacheProvider.getCacheFromPath(showPath);
      //this.setState({showName, showPath, cachePath});
      const folder = `${showPath}/${video.season}`;
      const episode = Object.keys(cachePath.folders[video.season].files).sort(window.tvShowSort).indexOf(video.episode);
      this.props.videoLoader.loadVideo("tv", folder, episode);
  }

  cancelShowChooser() {
    this.setState({"showName": null});
  }

    render() {
		let videos = this.state.videos.slice(0, 5).map((video) => {
            const imageSource = `${this.props.imageRoot}?showName=${video.show}`
            return <div style={{"display": "inline-block", width: "200px", verticalAlign: "top", wordWrap: "break-word", margin: "10px 10px"}}
            key={video.show} onClick={this.play.bind(this, video)}>
            <img style={{display: "block"}} src={imageSource} width="200px" height="300px" />
            {video.show}
            </div>
        });
        
        if(this.state.videos.length > 0) {
            videos = <div>
                <div>Keep Watching</div>
                {videos}
                </div>;
        }

		let showPicker = null;

		if(this.state.showName) {
			showPicker = <ShowPicker 
                router={this.props.router}
                videoLoader={this.props.videoLoader}
				showProgressProvider={this.props.showProgressProvider}
				showName={this.state.showName}
                showPath={this.state.showPath}
				cancelFunction={this.cancelShowChooser.bind(this)}
				showCache={this.state.cachePath}>
			</ShowPicker>
		}
		return (
				<div>
				 {videos}
				 {showPicker}
				</div>
		)
	 }
 }

module.exports = KeepWatching;
