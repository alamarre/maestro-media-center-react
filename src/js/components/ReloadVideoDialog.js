const React = require("react");
const { Modal, } = require("react-bootstrap");

const ScrollableComponent = require("./ScrollableComponent");

class ReloadVideoDialog extends ScrollableComponent {
  constructor(props) {
    super(props, ["reload", "home"]);
    this.state=Object.assign({}, this.state);
  }

  moveRight() {
    this.focusNext();
  }

  moveLeft() {
    this.focusPrevious();
  }

  render() {
    const body = <div>
      <Modal show={true} animation={false} onHide={() => this.props.goHome()}>
        <Modal.Header>
          <Modal.Title>The video has ended</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <label>Reload</label>
          <button ref="reload" className="remoteButton" onClick={() => this.props.reload()}><i className="fa fa-refresh fa-3x"></i></button>

          <label>Go Home</label>
          <button ref="home" className="remoteButton" onClick={() => this.props.goHome()}><i className="fa fa-home fa-3x"></i></button>

        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
    </div>;

    return (
      <div>{body}</div>
    );
  }
}

module.exports = ReloadVideoDialog;
