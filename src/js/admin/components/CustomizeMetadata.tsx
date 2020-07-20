import React from "react";

import MetadataPossibility from "./MetadataPossibility";
import ApiCaller from "../../utilities/providers/ApiCaller";
import { TextField } from "@material-ui/core";

export interface MetadataProps {
  apiCaller: ApiCaller;
}

export interface MetadataState {
  current: any;
  name: string;
  metadataName: string;
  videoType: string;
}

export default class Metadata extends React.Component<MetadataProps, MetadataState> {
  constructor(props) {
    super(props);
    this.state = { current: null, name: "", metadataName: "", videoType: "movie" };
  }

  componentDidMount() {

  }

  async search() {
    const metatadata: any = await this.props.apiCaller.get("metadata", `${this.state.videoType}/${this.state.metadataName}`);
    const item = {
      name: null, possibilities: metatadata.results.map(r => {
        return {
          id: r.id,
          title: r.title || r.name,
          summary: r.overview,
          image: "http://image.tmdb.org/t/p/original" + r.poster_path,
          year: (r.release_date && r.release_date.substring(0, 4)) || (r.first_air_date && r.first_air_date.substring(0, 4)),
        };
      })
    };
    this.setState({ current: item });
  }

  async approveMetadata(metadata, index) {
    console.log("approving metadata", metadata, index);
    const source = metadata.possibilities[index];
    await this.props.apiCaller.put("metadata", `${this.state.videoType}/${this.state.name}`, {
      source: "TMDB",
      id: source.id,
      poster: source.image,
      overview: source.summary,
    });
    this.setState({ name: "", metadataName: "", current: null });
  }

  render() {
    let possibility = null;
    if (this.state.current) {
      possibility = <MetadataPossibility approveFunction={this.approveMetadata.bind(this, this.state.current)} width="150px" height="225px" item={this.state.current} />
    }
    return (
      <div>
        Type:
        <select onChange={(evt) => this.setState({ videoType: evt.target.value })}>
          <option value="movie">Movie</option>
          <option value="tv/show">TV Show</option>
        </select>
        <div>
          <TextField  id="filled-basic" label="Name" variant="filled" onChange={(evt) => this.setState({ name: evt.target.value })} value={this.state.name} />
        </div>

        <div>
          Name to search for:
          <input type="text" value={this.state.metadataName} onChange={(evt) => this.setState({ metadataName: evt.target.value })} />
        </div>
        <div>
          <input type="button" onClick={() => this.search()} value="Search" />
        </div>
        {possibility}
      </div>
    );
  }
}


