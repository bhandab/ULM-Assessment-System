import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  getAssessmentCycles,
  createCycle,
  updateCycleName,
  deleteCycle,
  cycleMigrate,
  closeCycle
} from "../../actions/assessmentCycleAction";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Spinner,
  Button,
  Modal,
  Form,
  Card,
  ListGroup,
  Dropdown
} from "react-bootstrap";
import Delete from "../../utils/Delete";

class AssessmentCycle extends Component {
  state = {
    show: false,
    editShow: false,
    cycleName: "",
    cycleID: null,
    deleteShow: false,
    migrate: false,
    closeShow: true,
    cycleClose: false
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
    let name = e.target.cycleName.value;

    if (e.target.migrateCheck.checked) {
      let oldCycleID = e.target.cycleSelect.value;
      this.props.cycleMigrate(name, oldCycleID);
      this.setState({ migrate: false });
    } else {
      this.props.createCycle({ cycleTitle: name }, this.props.history);
    }
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

  cycleCloseShow = e => {
    this.setState({ cycleClose: true, cycleID: e.target.value });
  };

  cycleCloseHide = () => {
    this.setState({ cycleClose: false });
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

  migrateSelect = e => {
    this.setState({ migrate: e.target.checked });
  };

  endCycle = () => {
    this.props.closeCycle(this.state.cycleID);
    this.props.getAssessmentCycles();
    this.setState({ cycleClose: false });
  };

  render() {
    let cyclesList = null;
    let cyclesOptions = [];
    let closedCycles = [];
    if (
      this.props.cycles.cycles !== null &&
      this.props.cycles.cycles !== undefined
    ) {
      if (
        this.props.cycles.cycles.cycles !== null &&
        this.props.cycles.cycles.cycles !== undefined
      ) {
        cyclesList = this.props.cycles.cycles.cycles.map(cycle => {
          cyclesOptions.push(
            <option value={cycle.cycleID} key={"opt" + cycle.cycleID}>
              {cycle.cycleName}
            </option>
          );
          if (cycle.isClosed) {
            closedCycles.push(
              <ListGroup.Item key={cycle.cycleID}>
                <Link
                  to={{
                    pathname: "/admin/cycles/cycle/" + cycle.cycleID
                  }}
                >
                  {cycle.cycleName}
                </Link>
              </ListGroup.Item>
            );
          } 
          if (!cycle.isClosed) {
            return (
              <ListGroup.Item key={cycle.cycleID}>
                <Link
                  params={cycle.cycleName}
                  name={cycle.cycleID}
                  to={{
                    pathname: "/admin/cycles/cycle/" + cycle.cycleID
                  }}
                >
                  {cycle.cycleName}
                </Link>
                <Dropdown drop='left' className="float-right cycle">
                  <Dropdown.Toggle 
                  
                  variant="success" id="dropdown-basic">
                  <i className="fas fa-ellipsis-v"></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                  <Dropdown.Item href={`/admin/cycles/cycle/${cycle.cycleID}/report`}>
                    <Button variant="success">
                    &nbsp;VIEW REPORT
                    </Button>
                  </Dropdown.Item>

                  <Dropdown.Item>
                    <Button
                      variant = "info"
                      name={cycle.cycleID}
                      value={cycle.cycleName}
                      onClick={this.editShow.bind(this)}
                    >&nbsp;&nbsp;EDIT CYCLE&nbsp;&nbsp;</Button>
                  </Dropdown.Item>

                  <Dropdown.Item>
                    <Button
                      variant="warning"
                      className="rounded"
                      onClick={this.cycleCloseShow}
                      value={cycle.cycleID}
                      name={cycle.cycleName}
                    >
                      &nbsp;CLOSE CYCLE
                    </Button>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Button
                      variant="danger"
                      name={cycle.cycleID}
                      value={cycle.cycleName}
                      onClick={this.deleteShow.bind(this)}
                    >DELETE CYCLE</Button>
                  </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </ListGroup.Item>
            );
          } else {
            return null;
          }
        });
        if (cyclesList.length < 1) {
          cyclesList = <ListGroup.Item>No Cycles Present</ListGroup.Item>;
        }
        console.log(closedCycles)
        if (closedCycles.length < 1) {
          closedCycles = <ListGroup.Item>No Cycles Present</ListGroup.Item>;
        }
      }
    } else {
      cyclesList = <Spinner animation="border" variant="primary" />;
    }

    return (
      <Fragment>
        <section className="panel important border border-info rounded p-3">
        <ul className="ml-0 mb-0" id="breadcrumb">
        <li className="ml-0"><Link to="/admin/dashboard"><span><i className="fas fa-home mr-1"></i></span>Dashboard </Link></li>
  <li><Link to="/admin/cycles"><span> <i className="fas mr-1 fa-recycle"></i></span>Cycles</Link></li>
</ul>
          <Card>
            <Card.Header style={{ textAlign: "center" }}>
              <h2>
                <strong>Assessment Cycles</strong>
              </h2>
            </Card.Header>
            <Card.Body>
              <Card>
                <Card.Header>
                  <h2>Active Cycles</h2>
                </Card.Header>
                <Card.Body>
                  <ul className="list-group">
                    {cyclesList === null ? (
                      <li className="list-group-item">No Cycles Present</li>
                    ) : (
                      cyclesList
                    )}
                  </ul>
                  <Button className="mt-3" onClick={this.modalShow}>
                    Create New Cycle
                  </Button>
                </Card.Body>
              </Card>
              <Card className="mt-5">
                <Card.Header>
                  <h2>Closed Cycles</h2>
                </Card.Header>
                <Card.Body>
                  <ul className="list-group">
                    {closedCycles === null ? (
                      <li className="list-group-item">No Cycles Present</li>
                    ) : (
                      closedCycles
                    )}
                  </ul>
                </Card.Body>
              </Card>
              {/* <ul className="list-group">
              {cyclesList === null ? (
                <li className="list-group-item">No Cycles Present</li>
              ) : (
                cyclesList
              )}
            </ul> */}
            </Card.Body>
          </Card>
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
              <Form.Control
                name="cycleName"
                placeholder="Cycle Name"
                required
              />
              <Form.Group controlId="formBasicChecbox">
                <Form.Check
                  type="checkbox"
                  name="migrateCheck"
                  label="Migrate From Previous Cycles"
                  id="custom-checkbox"
                  onChange={this.migrateSelect.bind(this)}
                />
              </Form.Group>
              {this.state.migrate ? (
                <select id="cycleSelect" name="cycleSelect">
                  {cyclesOptions}
                </select>
              ) : null}
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

        <Modal
          show={this.state.cycleClose}
          onHide={this.cycleCloseHide}
          centered
        >
          <Modal.Header closeButton>
            <h3>Confirm Cycle Close</h3>
          </Modal.Header>
          <Modal.Body>
            After you close you can only view the contents of this cycle.
            Changes cannot be made.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={this.cycleCloseHide}>
              Cancel
            </Button>
            <Button variant="success" onClick={this.endCycle}>
              Close Cycle
            </Button>
          </Modal.Footer>
        </Modal>
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
  cycles: state.cycles,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  {
    getAssessmentCycles,
    createCycle,
    updateCycleName,
    deleteCycle,
    cycleMigrate,
    closeCycle
  }
)(AssessmentCycle);
