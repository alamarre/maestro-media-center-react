import React from 'react'

import { Link } from 'react-router'
import ShowPicker from "./ShowPicker"

class VideosListing extends React.Component {
  constructor(props) {
      super(props);
      this.state = {root: "", folders: [], files: []};
      if(this.props.episodeLoader) {
          this.props.episodeLoader.getListingPromise("").then(this.loadFolder.bind(this));
      }
  }

	fetchFolder(folder) {
		var newRoot = this.state.root+"/"+folder;
		this.setState({root: newRoot});
		this.props.episodeLoader.getListingPromise(newRoot).then(this.loadFolder.bind(this));
	}

	loadFolder(folderData) {
		this.setState({"folders": folderData.folders, "files": folderData.files});
	}

	selectSource(item) {
        this.props.cacheProvider.getCacheFromPath(item.path)
        .then(cachePath => {
			this.setState({showName: item.name, showPath: item.path, cachePath: cachePath})
        });
    }

    cancelShowChooser() {
        this.setState({"showName": null});
    }

    loadVideo(type, folder, index) {
        this.props.videoLoader.loadVideo(type, folder, index);
    }

    render() {
		var folders = this.state.folders.map((folder) => {
			return <div key={folder} onClick={this.fetchFolder.bind(this, folder)}>{folder}</div>
		});

		//var index = 0;
		var files = this.state.files.map((file) => {
			let fileName = (file.name) ? file.name : file;
			let folder = (file.path) ? file.path.substring(0, file.path.lastIndexOf("/")) : self.state.root;
			
			
				
			if(file.type && file.type == "tv") {
				const imageSource = `${this.props.imageRoot}?showName=${file.name}`;
				return <div style={{margin: "20px"}} key={fileName} onClick={evt => this.selectSource(file)} >
					<img style={{border: "white 1px solid", marginRight: "10px"}} src={imageSource} width="50px" height="75px" />
					{fileName}
				</div>
			}

			const imageSource = `${this.props.imageRoot}?path=${file.path}`;
            
			return <div style={{margin: "20px"}} key={fileName} onClick={this.loadVideo.bind(this, file.type, folder, file.index)} >
				<img style ={{border: "white 1px solid", marginRight: "10px"}} src={imageSource} width="50px" height="75px" /> 
				{fileName}
			</div>
		});

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
				 {folders}
				 {files}
				 {showPicker}
				</div>
		)
	 }
 }

module.exports = VideosListing
