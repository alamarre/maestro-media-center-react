const React = require("react");

const MetadataPossibility = require("./MetadataPossibility");

class Metadata extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tvShowsToSelect: [], moviesToSelect: [], };
    this.loadMetadata(props.apiRequester);
  }

  componentDidMount() {

  }

  async loadMetadata(apiRequester) {
    const moviesToSelect = (await apiRequester.apiRequestPromise("metadata", "missing/movie"))
      .map(m => {
        const parsed = JSON.parse(m.value);
        return {
          name: m.movieName,
          possibilities: parsed.results.map(r => {
            return {
              id: r.id,
              title: r.title,
              summary: r.overview,
              image: "http://image.tmdb.org/t/p/original"+r.poster_path,
              year: r.release_date.substring(0,4),
            };
          }),
        };
      });

    const tvShowsToSelect = (await apiRequester.apiRequestPromise("metadata", "missing/tv/show")).map(m => {
      let parsed = JSON.parse(m.value);
      if(parsed.results) {
        parsed = parsed.results;
      }
      return {
        name: m.showName,
        possibilities: parsed.map(r => {
          return {
            id: r.id,
            title: r.name,
            summary: r.overview,
            image: "http://image.tmdb.org/t/p/original"+r.poster_path,
            year: r.first_air_date.substring(0,4),
          };
        }),
      };
    });
    this.setState({moviesToSelect, tvShowsToSelect,});
  }

  cancelShowChooser() {
    this.setState({ "showName": null, });
  }

  async approveMovieMetadata(metadata, index) {
    console.log("approving movie", metadata, index);
    const source = metadata.possibilities[index];
    await this.props.apiRequester.apiRequestPromise("metadata", `movie/${metadata.name}`, {
      data: JSON.stringify({
        source: "TMDB",
        id: source.id,
        poster: source.image,
        overview: source.summary,
      }),
      type: "PUT",
      contentType: "application/json",
    });

    await this.loadMetadata(this.props.apiRequester);
  }

  async approveTvShowMetadata(metadata, index) {
    console.log("approving movie", metadata, index);
    const source = metadata.possibilities[index];
    await this.props.apiRequester.apiRequestPromise("metadata", `tv/show/${metadata.name}`, {
      data: JSON.stringify({
        source: "TMDB",
        id: source.id,
        poster: source.image,
        overview: source.summary,
      }),
      type: "PUT",
      contentType: "application/json",
    });

    await this.loadMetadata(this.props.apiRequester);
  }

  render() {
    const movieItems = this.state.moviesToSelect.map(m => {
      return <MetadataPossibility key={m.name} approveFunction={this.approveMovieMetadata.bind(this,m)} width="150px" height="225px" item={m} />;
    });

    const tvShowItems = this.state.tvShowsToSelect.map(m => {
      return <MetadataPossibility key={m.name} approveFunction={this.approveTvShowMetadata.bind(this,m)} width="150px" height="225px" item={m} />;
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

module.exports = Metadata;
