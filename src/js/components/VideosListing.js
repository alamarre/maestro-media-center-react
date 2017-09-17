import React from 'react'

import { Link } from 'react-router'

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

  render() {
		var self = this;
		var folders = this.state.folders.map(function(folder) {
			return <div key={folder} onClick={self.fetchFolder.bind(self, folder)}>{folder}</div>
		});

		var index = 0;
		var files = this.state.files.map(function(file) {
			var url = "view?index="+index+"&folder="+encodeURIComponent(self.state.root)+"&file="+encodeURIComponent(file);
			index++;
			return <div key={file} ><Link to={url}>{file}</Link></div>
		});
		return (
				<div>
				 {folders}
				 {files}
				</div>
		)
	 }
 }

module.exports = VideosListing
