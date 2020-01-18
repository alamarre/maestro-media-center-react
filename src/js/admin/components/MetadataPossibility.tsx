import React from "react";

export interface MetadataPossibilityProps {
  item: any;
  width: string;
  height: string;
  approveFunction: (number: number) => void;
}
export interface MetadataPossibilityState {
  selectedPossibility: number;
}

export default class MetadataPossibility extends React.Component<MetadataPossibilityProps, MetadataPossibilityState> {
  constructor(props) {
    super(props);
    this.state = { selectedPossibility: 0, };
  }

  componentDidMount() {

  }

  selectItem(event) {
    this.setState({ selectedPossibility: event.target.value, });
  }

  render() {
    const item = this.props.item;
    const { name, possibilities, } = item;
    const possibility = possibilities[this.state.selectedPossibility];
    const selectOptions = possibilities.map((s, i) => {
      return <option key={i} value={i}>{s.title} ({s.year})</option>;
    });
    const { summary, image, } = possibility;
    return (
      <div>
        <div>{name}</div>
        <hr />
        <div style={{ display: "table", overflow: "text-wrap", }}>
          <img style={{ display: "table-cell", verticalAlign: "top", margin: "10px", }} width={this.props.width} height={this.props.height} src={image} />
          <div style={{ display: "table-cell", verticalAlign: "top", margin: "10px", }}>
            <select value={this.state.selectedPossibility} style={{ width: "80vw", }} onChange={this.selectItem.bind(this)}>{selectOptions}</select>
            <p style={{ overflowWrap: "break-word", width: "80vw", }}>{summary}</p>
          </div>
        </div>
        <button onClick={() => this.props.approveFunction(this.state.selectedPossibility)} >Approve</button>
      </div>
    );
  }
}


