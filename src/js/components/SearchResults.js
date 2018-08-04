import React from 'react'
import ShowPicker from "./ShowPicker"

class SearchResults extends React.Component {

    constructor(props) {
        super(props);
        this.state = {"searchResults": []};
    }

    search(value) {
        if(!value || value == "") {
            this.setState({"searchResults": []});
        }
        this.props.searcher.getResults(value).then(results => {
            this.setState({"searchResults": results});
        });
    }

    selectSource(item) {
        Promise.all([this.props.cacheProvider.isTvShow(item.path), this.props.cacheProvider.getCacheFromPath(item.path)])
        .then(values => {
            let isTvShow = values[0];
            let cachePath = values[1];
            if(isTvShow) {
                this.setState({showName: item.name, showPath: item.path, cachePath: cachePath})
            } else {
                let folder = item.path.substring(0, item.path.lastIndexOf("/"));
                this.props.videoLoader.loadVideo(item.type, folder, item.index)
            }
        })
    }

    cancelShowChooser() {
        this.setState({"showName": null});
    }

    render() {
        let searchResults = this.state.searchResults.map(item => {
            const imageSource = this.props.cacheProvider.isTvShow(item.path) ?
                `${this.props.imageRoot}?showName=${item.name}` :
                `${this.props.imageRoot}?path=${item.path}`;
            return <li className="list-group-item" key={item.path} onClick={evt => this.selectSource(item)}>
            <img style ={{border: "white 1px solid", marginRight: "10px"}} src={imageSource} width="50px" height="75px" />
            {item.name}
            </li>
        });

        searchResults = <ul style={{position: "absolute"}} className="list-group">{searchResults}</ul>;
        let showPicker = null;
        if(this.state.showName) {
            showPicker = <ShowPicker 
                router={this.props.router}
                videoLoader={this.props.videoLoader}
                showProgressProvider={this.props.showProgressProvider}
                showPath = {this.state.showPath}
                showName={this.state.showName}
                cancelFunction={this.cancelShowChooser.bind(this)}
                showCache={this.state.cachePath}>
            </ShowPicker>
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
