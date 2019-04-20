import React, { Component, Fragment } from "react";
import {
  getCycleMeasures,
  linkOutcomeToCycle,
  updateOutcomeName,
  deleteOutcome
} from "../../actions/assessmentCycleAction";
import { getOutcomes } from "../../actions/outcomesAction";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Spinner, Modal, Form, Button, InputGroup } from "react-bootstrap";
import Delete from "../../utils/Delete";

class CycleMeasures extends Component {
  state = {
    addOutcome: false,
    createOutcome: false,
    editShow: false,
    deleteShow: false,
    outcomeName: "",
    outcomeID: null
  };

  componentDidMount() {
    if (
      !this.props.auth.isAuthenticated &&
      this.props.auth.user.role !== "coordinator"
    ) {
      this.props.history.push("/login");
    }

    let id = this.props.match.params.cycleID;
    this.props.getCycleMeasures(id);
  }

  clickHandler = e => {
    e.preventDefault();

    if (!this.state.addOutcomes) {
      this.props.getOutcomes();
    }
    this.setState({ addOutcomes: !this.state.addOutcomes });
  };

  outcomeAddHandler = e => {
    e.preventDefault();
    // console.log(e.target.outcomes.value);
    this.setState({ addOutcomes: !this.state.addOutcomes });
    this.props.linkOutcomeToCycle(this.props.match.params.id, {
      outcomeDescription: e.target.outcomes.value
    });
  };

  createNewButtonHandler = e => {
    e.preventDefault();
    this.setState({ createOutcome: !this.state.createOutcome });
  };

  outcomeCreateHandler = e => {
    e.preventDefault();
    this.props.linkOutcomeToCycle(this.props.match.params.cycleID, {
      outcomeDescription: e.target.newOutcome.value
    });
    this.setState({ createOutcome: false });
  };

  createOutcomeShow = () => {
    this.setState({ createOutcome: true });
  };

  createOutcomeHide = () => {
    this.setState({ createOutcome: false });
  };

  addOutcomeShow = () => {
    this.props.getOutcomes();
    this.setState({ addOutcome: true });
  };

  addOutcomeHide = () => {
    this.setState({ addOutcome: false });
  };

  editShow = e => {
    this.setState({
      outcomeName: e.target.value,
      outcomeID: e.target.name,
      editShow: true
    });
  };

  editHide = () => {
    this.setState({ editShow: false });
  };

  deleteShow = e => {
    this.setState({
      outcomeName: e.target.value,
      outcomeID: e.target.name,
      deleteShow: true
    });
  };

  deleteHide = () => {
    this.setState({ deleteShow: false });
  };

  saveChangesHandler = e => {
    e.preventDefault();
    const value = e.target.outcomeName.value;
    this.props.updateOutcomeName(
      this.props.match.params.cycleID,
      this.state.outcomeID,
      { outcomeDescription: value }
    );
    this.setState({ outcomeName: "", outcomeID: null, editShow: false });
  };

  outcomeDeleteHandler = () => {
    this.props.deleteOutcome(
      this.props.match.params.cycleID,
      this.state.outcomeID
    );
    this.setState({ outcomeName: "", outcomeID: null, deleteShow: false });
  };

  render() {
    console.log(this.props);
    let title = null;
    let list = <Spinner animation="border" variant="primary" />;
    let outcomeArray = null;

    if (this.props.cycles.cycleLoading !== true) {
      let cycleID = this.props.match.params.cycleID;

      if (
        this.props.cycles.cycleMeasures !== null &&
        this.props.cycles.cycleMeasures !== undefined
      ) {
        if (this.props.cycles.cycleMeasures.outcomes.length > 0) {
          outcomeArray = this.props.cycles.cycleMeasures.outcomes;
          list = this.props.cycles.cycleMeasures.outcomes.map(outcome => {
            return (
              <li className="list-group-item" key={outcome.outcomeID}>
                <Link
                  to={
                    "/admin/cycles/cycle/" +
                    cycleID +
                    "/outcomes/" +
                    outcome.outcomeID
                  }
                >
                  {outcome.outcomeName}
                </Link>
                <button
                  style={{ border: "none", background: "none" }}
                  name={outcome.outcomeID}
                  value={outcome.outcomeName}
                  onClick={this.editShow.bind(this)}
                  className="outcome-edit ml-2"
                />
                <button
                  style={{ border: "none", background: "none" }}
                  name={outcome.outcomeID}
                  value={outcome.outcomeName}
                  onClick={this.deleteShow.bind(this)}
                  className="delete"
                />
              </li>
            );
          });
        } else {
          list = <li className="list-group-item">No Outcomes Present.</li>;
        }
        title = this.props.cycles.cycleMeasures.cycleName;
      }
    }
    let selections = null;

    if (
      this.props.cycles.cycleMeasures !== undefined &&
      this.props.cycles.cycleMeasures !== null
    ) {
      if (
        this.props.cycles.cycleMeasures !== null &&
        this.props.outcomes.outcomes !== null
      ) {
        outcomeArray = this.props.cycles.cycleMeasures.outcomes;
        selections = this.props.outcomes.outcomes.map((item, index) => {
          const temp = outcomeArray.find(outcome => {
            return outcome.outcomeName === item;
          });
          if (temp === undefined) {
            return (
              <option key={index} value={item}>
                {item}
              </option>
            );
          } else {
            return null;
          }
        });
      }
    }

    return (
      <Fragment>
        <section className="panel important border border-info rounded p-3">
          <div className="container">
            <div className="row">
              <div className="btn-group btn-breadcrumb">
                <a href="#" className="btn btn-primary">
                  Admin
                </a>
                <a href="#" className="btn btn-primary">
                  Cycles
                </a>
                <a href="#" className="btn btn-primary">
                  Outcomes
                </a>
              </div>
            </div>
          </div>
          <h2>{title}</h2>
          <hr />
          <ol className="list-group">{list}</ol>
          <Button
            className="btn mt-3 float-right ml-3"
            onClick={this.addOutcomeShow}
          >
            Add Outcome
          </Button>

          <Button
            className="btn mt-3 float-right"
            onClick={this.createOutcomeShow}
          >
            Create Outcome
          </Button>
        </section>

        <Modal
          show={this.state.createOutcome}
          onHide={this.createOutcomeHide}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Create New Outcome
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.outcomeCreateHandler.bind(this)}>
              <Form.Control
                name="newOutcome"
                defaultValue={this.state.outcomeName}
              />
              <Button className="mt-3 float-right" type="submit">
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={this.state.addOutcome}
          onHide={this.addOutcomeHide}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Add an Outcome
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.outcomeAddHandler.bind(this)}>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text id="basic-addon7" className="text-bold">
                    Select an Outcome:
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <select name="outcomes" className="custom-select">
                  {selections}
                </select>
              </InputGroup>
              <Button className="mt-3 float-right" type="submit">
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={this.state.editShow}
          onHide={this.editHide}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Edit Outcome Name
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.saveChangesHandler.bind(this)}>
              <Form.Control
                name="outcomeName"
                defaultValue={this.state.outcomeName}
              />
              <Button className="mt-3 float-right" type="submit">
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        <Delete
          hide={this.deleteHide}
          show={this.state.deleteShow}
          value="Learning Outcome"
          name={this.state.outcomeName}
          delete={this.outcomeDeleteHandler}
        />
      </Fragment>
    );
  }
}

CycleMeasures.propTypes = {
  getCycleMeasures: PropTypes.func.isRequired,
  getOutcomes: PropTypes.func.isRequired,
  linkOutcomeToCycle: PropTypes.func.isRequired,
  cycles: PropTypes.object.isRequired,
  updateOutcomeName: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  deleteOutcome: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  cycleMeasures: state.cycleMeasures,
  cycles: state.cycles,
  outcomes: state.outcomes,
  errors: state.errors,
  auth: state.auth
});

export default connect(
  MapStateToProps,
  {
    getOutcomes,
    linkOutcomeToCycle,
    getCycleMeasures,
    updateOutcomeName,
    deleteOutcome
  }
)(CycleMeasures);
