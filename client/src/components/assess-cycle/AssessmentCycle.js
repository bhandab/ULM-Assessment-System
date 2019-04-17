import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  getAssessmentCycles,
  createCycle,
  updateCycleName,
  deleteCycle
} from "../../actions/assessmentCycleAction";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Spinner, Button, Modal, Form } from "react-bootstrap";
import Delete from "../../utils/Delete";

class AssessmentCycle extends Component {
  state = {
    show: false,
    editShow: false,
    cycleName: "",
    cycleID: null,
    deleteShow: false
  };

  componentDidMount() {
    if (
      !this.props.auth.isAuthenticated ||
      this.props.auth.user.role !== "coordinator"
    ) {
      this.props.history.push("/login");
    }
    this.props.getAssessmentCycles();
  }

  submitHandler = e => {
    e.preventDefault();
    let value = e.target.cycleName.value;
    this.props.createCycle({ cycleTitle: value }, this.props.history);
  };

  saveChangesHandler = e => {
    e.preventDefault();
    const value = e.target.cycleName.value;
    this.props.updateCycleName(this.state.cycleID, { cycleTitle: value });
    this.setState({ cycleName: "", cycleID: null, editShow: false });
  };

  deleteCycleHandler = () => {
    this.props.deleteCycle(this.state.cycleID);
    this.setState({ cycleName: "", cycleID: null, deleteShow: false });
  };

  modalShow = () => {
    this.setState({ show: true });
  };

  modalHide = () => {
    this.setState({ show: false });
  };

  editShow = e => {
    this.setState({
      cycleName: e.target.value,
      cycleID: e.target.name,
      editShow: true
    });
  };

  editHide = () => {
    this.setState({ editShow: false });
  };

  deleteShow = e => {
    this.setState({
      cycleName: e.target.value,
      cycleID: e.target.name,
      deleteShow: true
    });
  };

  deleteHide = () => {
    this.setState({ deleteShow: false });
  };

  render() {

    let cyclesList = null;
    if (
      this.props.cycles.cycles !== null &&
      this.props.cycles.cycles !== undefined
    ) {
      if (
        this.props.cycles.cycles.cycles !== null &&
        this.props.cycles.cycles.cycles !== undefined
      ) {
        cyclesList = this.props.cycles.cycles.cycles.map(cycle => (
          <li className="list-group-item" key={cycle.cycleID}>
            <Link
              params={cycle.cycleName}
              name={cycle.cycleID}
              to={{
                pathname: "/admin/cycles/cycle/" + cycle.cycleID
              }}
            >
              {cycle.cycleName}
            </Link>
            <button
              style={{ border: "none", background: "none" }}
              name={cycle.cycleID}
              value={cycle.cycleName}
              onClick={this.editShow.bind(this)}
              className="outcome-edit ml-2"
            />
            <button
              style={{ border: "none", background: "none" }}
              name={cycle.cycleID}
              value={cycle.cycleName}
              onClick={this.deleteShow.bind(this)}
              className="delete"
            />
          </li>
        ));
        if (cyclesList.length === 0) {
          cyclesList = <li className="list-group-item">No Cycles Present</li>;
        }
      }
    } else {
      cyclesList = <Spinner animation="border" variant="primary" />;
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
              </div>
            </div>
          </div>

          <h2>
            <strong>Assessment Cycles</strong>
          </h2>
          <ul className="list-group">
            {cyclesList === null ? (
              <li className="list-group-item">No Cycles Present</li>
            ) : (
              cyclesList
            )}
          </ul>
          <Button className="ml-3 mr-3 float-right" onClick={this.modalShow}>
            Create New Cycle
          </Button>
        </section>

        <Modal
          size="lg"
          show={this.state.show}
          onHide={this.modalHide}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Create New Assessment Cycle
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.submitHandler.bind(this)}>
              <Form.Control name="cycleName" placeholder="Cycle Name" />
              <Button
                className="mt-3 float-right"
                type="submit"
                onClick={this.modalHide}
              >
                Create
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
              Edit Cycle Name
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.saveChangesHandler.bind(this)}>
              <Form.Control
                name="cycleName"
                defaultValue={this.state.cycleName}
              />
              <Button
                className="mt-3 float-right"
                type="submit"
                onClick={this.modalHide}
              >
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        <Delete
          hide={this.deleteHide}
          show={this.state.deleteShow}
          value="Assessment Cycle"
          name={this.state.cycleName}
          delete={this.deleteCycleHandler}
        />
      </Fragment>
    );
  }
}

AssessmentCycle.propTypes = {
  getAssessmentCycles: PropTypes.func.isRequired,
  createCycle: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  updateCycleName: PropTypes.func.isRequired,
  deleteCycle: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  cycles: state.cycles
});

export default connect(
  mapStateToProps,
  { getAssessmentCycles, createCycle, updateCycleName, deleteCycle }
)(AssessmentCycle);
