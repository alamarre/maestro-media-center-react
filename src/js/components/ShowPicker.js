import React from 'react'
import Modal from 'react-modal';

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
        let url = "view?type=tv&index="+index+"&folder="+encodeURIComponent(folder)+"&file="+encodeURIComponent(episode);
        this.props.router.push(url);
    }

    render() {
        if(!this.state.season) {
            return <div></div>;
        }

        let seasons = Object.keys(this.props.showCache.folders).map((season) => {
            return <option key={season} value={season}>{season}</option>;
        });

        let episodes = this.state.season == null ? null : Object.keys(this.props.showCache.folders[this.state.season].files).map(episode => {
            return <div onClick={evt => this.play(episode)} value={episode} key={episode}>{episode}</div>;
        });

        let keepWatchingView = null;
        if(this.state.keepWatchingData && this.state.season == this.state.keepWatchingData.season) {
            let episode = this.state.keepWatchingData.episode;
            keepWatchingView = <div onClick={evt => this.play(episode)}>Keep watching: {episode}</div>;
        }

        let body = <div>
            <Modal isOpen={true}>
                
                <div>{this.props.showName}</div>
                {keepWatchingView}
                <div>
                    <select defaultValue={this.state.season} onChange={evt => this.setSeason(evt.target.value)}>
                        {seasons}
                    </select>
                </div>
                <div>
                </div>
                {episodes}
                <button onClick={evt => this.props.cancelFunction()}>Cancel</button>
            </Modal>
        </div>;
   
        return (
            <div>{body}</div>
        )
    }
}

export default ShowPicker;
