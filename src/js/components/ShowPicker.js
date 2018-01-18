import React from 'react'
import {Modal} from 'react-bootstrap';

class ShowPicker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {"season": null, "episode": null};
        props.showProgressProvider.getShowsInProgress().then(shows => {
            let seasonSet = false;
            for(let show of shows) {
                if(show.show === props.showName) {
                    this.setState({
                        "season": show.season,
                     "episode": show.episode,
                     "keepWatchingData": show
                    });
                    seasonSet = true;
                }
            }

            if(!seasonSet) {
                let firstSeasonName = Object.keys(props.showCache.folders)[0];
                let firstEpisodeName = Object.keys(props.showCache.folders[firstSeasonName].files)[0];
                this.setState({"season": firstSeasonName, "episode": firstEpisodeName});
            }
        });
    }

    setSeason(season) {
        let firstEpisodeName = Object.keys(this.props.showCache.folders[season].files)[0];
        this.setState({"season": season, "episode": firstEpisodeName})
    }

    setEpisode(episode) {
        this.setState({"episode": episode})
    }

    play(episode) {
        let files = Object.keys(this.props.showCache.folders[this.state.season].files);
        let index = -1;
        for(let i=0; i<files.length; i++) {
            if(files[i]==episode) {
                index = i;
            }
        }
        let folder = this.props.showPath + "/" +this.state.season;
        //let url = "view?type=tv&index="+index+"&folder="+encodeURIComponent(folder)+"&file="+encodeURIComponent(episode);
        //this.props.router.push(url);
        this.props.videoLoader.loadVideo("tv", folder, index);
    }

    render() {
        if(!this.state.season) {
            return <div></div>;
        }

        let seasons = Object.keys(this.props.showCache.folders).sort(tvShowSort).map((season) => {
            return <option key={season} value={season}>{season}</option>;
        });

        let episodes = this.state.season == null ? null : Object.keys(this.props.showCache.folders[this.state.season].files).map(episode => {
            return <div key={episode}>
                <button className="maestroButton roundedButton fa fa-play" onClick={evt => this.play(episode)}></button>
                <span>{episode}</span>
            </div>;

        });

        let keepWatchingView = null;
        if(this.state.keepWatchingData && this.state.season == this.state.keepWatchingData.season) {
            let episode = this.state.keepWatchingData.episode;
            keepWatchingView = <div>
                <button className="maestroButton roundedButton fa fa-play c" onClick={evt => this.play(episode)}></button>
                <span>Keep watching: {episode}</span>
                </div>;
        }

        let body = <div>
            <Modal show={true} animation={false} onHide={evt => this.props.cancelFunction()}>
            <Modal.Header>
            <Modal.Title>{this.props.showName}</Modal.Title>
            </Modal.Header>
                
                <Modal.Body>
                
                {keepWatchingView}
                <div>
                    <select defaultValue={this.state.season} onChange={evt => this.setSeason(evt.target.value)}>
                        {seasons}
                    </select>
                </div>
                <div>
                </div>
                {episodes}
                </Modal.Body>
                <Modal.Footer>
                <button className="btn btn-secondary" onClick={evt => this.props.cancelFunction()}>Cancel</button>
                </Modal.Footer>
            </Modal>
        </div>;
   
        return (
            <div>{body}</div>
        )
    }
}

export default ShowPicker;
