import React from "react";

import MetadataPossibility from "./MetadataPossibility";
import ApiCaller from "../../utilities/providers/ApiCaller";

export interface MetadataProps {
  apiCaller: ApiCaller;
}

export interface MetadataState {
  tvShowsToSelect: any;
  moviesToSelect: any;
  showName: string;
}

export default class Metadata extends React.Component<MetadataProps, MetadataState> {
  constructor(props) {
    super(props);
    this.state = { tvShowsToSelect: [], moviesToSelect: [], showName: null, };
    this.loadMetadata();
  }

  componentDidMount() {

  }

  async loadMetadata() {
    const movieMetadata: any[] = await this.props.apiCaller.get("metadata", "missing/movie");
    const moviesToSelect = movieMetadata
      .map(m => {
        const parsed = JSON.parse(m.value);
        return {
          name: m.movieName,
          possibilities: parsed.results.map(r => {
            return {
              id: r.id,
              title: r.title,
              summary: r.overview,
              image: "http://image.tmdb.org/t/p/original" + r.poster_path,
              year: r.release_date && r.release_date.substring(0, 4),
            };
          }),
        };
      });
    const metadata: any[] = await this.props.apiCaller.get("metadata", "missing/tv/show");
    const tvShowsToSelect = metadata.map(m => {
      let parsed = JSON.parse(m.value);
      if (parsed.results) {
        parsed = parsed.results;
      }
      return {
        name: m.showName,
        possibilities: parsed.map(r => {
          return {
            id: r.id,
            title: r.name,
            summary: r.overview,
            image: "http://image.tmdb.org/t/p/original" + r.poster_path,
            year: r.first_air_date.substring(0, 4),
          };
        }),
      };
    });
    this.setState({ moviesToSelect, tvShowsToSelect, });
  }

  cancelShowChooser() {
    this.setState({ "showName": null, });
  }

  async approveMovieMetadata(metadata, index) {
    console.log("approving movie", metadata, index);
    const source = metadata.possibilities[index];
    await this.props.apiCaller.put("metadata", `movie/${metadata.name}`, {
      source: "TMDB",
      id: source.id,
      poster: source.image,
      overview: source.summary,
    });

    await this.loadMetadata();
  }

  async approveTvShowMetadata(metadata, index) {
    console.log("approving movie", metadata, index);
    const source = metadata.possibilities[index];
    await this.props.apiCaller.put("metadata", `tv/show/${metadata.name}`, {
      source: "TMDB",
      id: source.id,
      poster: source.image,
      overview: source.summary,
    });

    await this.loadMetadata();
  }

  render() {
    const movieItems = this.state.moviesToSelect.map(m => {
      return <MetadataPossibility key={m.name} approveFunction={this.approveMovieMetadata.bind(this, m)} width="150px" height="225px" item={m} />;
    });

    const tvShowItems = this.state.tvShowsToSelect.map(m => {
      return <MetadataPossibility key={m.name} approveFunction={this.approveTvShowMetadata.bind(this, m)} width="150px" height="225px" item={m} />;
    });
    return (
      <div>
        Movies
        {movieItems}
        TV Shows
        {tvShowItems}
      </div>
    );
  }
}


