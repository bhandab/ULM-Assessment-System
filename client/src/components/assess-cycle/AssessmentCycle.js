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
import { Spinner, Button, Modal, Form, Card, ListGroup} from "react-bootstrap";
import Delete from "../../utils/Delete";

class AssessmentCycle extends Component {
  state = {
    show: false,
    editShow: false,
    cycleName: "",
    cycleID: null,
    deleteShow: false,
    migrate:false,
    closeShow:true,
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
    
    if(e.target.migrateCheck.checked){
      let oldCycleID = e.target.cycleSelect.value
      console.log(name)
      console.log(oldCycleID)
      this.props.cycleMigrate(name,oldCycleID)
      this.setState({migrate:false})
    }
    else{
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
    this.setState({ show: false});
  };

  cycleCloseShow = (e) => {
    this.setState({cycleClose:true,cycleID:e.target.value})
  }

  cycleCloseHide = () => {
    this.setState({cycleClose:false})
  }

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

  migrateSelect = (e) => {
    console.log(e.target.checked)
    this.setState({migrate:e.target.checked})

  }

  endCycle = () => {
    console.log(this.state.cycleID)
    this.props.closeCycle(this.state.cycleID)
    this.setState({cycleClose:false})
  }

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
            <option value={cycle.cycleID} key={"opt"+cycle.cycleID}>{cycle.cycleName}</option>
          )
          if(cycle.isClosed){
            closedCycles.push (
            <ListGroup.Item key={cycle.cycleID}>
              <Link
                to={{
                  pathname: "/admin/cycles/cycle/" + cycle.cycleID
                }}
              >
                {cycle.cycleName}
              </Link>
            </ListGroup.Item>
          )}
          else {
            closedCycles.push (null)
          }
          if(!cycle.isClosed){
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
            <Button variant="danger"
            className="float-right rounded" 
            onClick={this.cycleCloseShow} 
            value={cycle.cycleID}
            name={cycle.cycleName}>CLOSE CYCLE</Button>
            <button
              style={{ border: "none", background: "none" }}
              name={cycle.cycleID}
              value={cycle.cycleName}
              onClick={this.editShow.bind(this)}
              className="outcome-edit ml-2 mr-3 float-right"
            />
            <button
              style={{ border: "none", background: "none" }}
              name={cycle.cycleID}
              value={cycle.cycleName}
              onClick={this.deleteShow.bind(this)}
              className="delete float-right"
            />
          </ListGroup.Item>
        )
            }
            else {
              return null
            }
          
      });
        if (cyclesList.length === 0) {
          cyclesList = <ListGroup.Item>No Cycles Present</ListGroup.Item>;
        }
        if(closedCycles.length === 0){
          closedCycles = <ListGroup.Item>No Cycles Present</ListGroup.Item>
        }
      }
    } else {
      cyclesList = <Spinner animation="border" variant="primary" />;
    }

    console.log(this.props)
    return (
      <Fragment>
        <section className="panel important border border-info rounded p-3">
{/*         
          <div className="row">
            <div className="btn-group btn-breadcrumb">
              <li  className="btn btn-primary brdbtn">
                Admin
              </li>
              <li className="btn btn-primary brdbtn">
                Cycles
              </li>
            </div>
          </div> */}

{/* <ol class="breadcrumb v1">
	<li class="breadcrumb-level"><a href="">Level 1</a></li>
	<li class="breadcrumb-level"><a href="">Level 2</a></li>
	<li class="breadcrumb-level"><a>Level 3</a></li>
</ol> */}
          <Card>
            <Card.Header>
          <h2>
            <strong>Assessment Cycles</strong>
          </h2>
          </Card.Header>
          <Card.Body>
            <Card>
              <Card.Header style={{textAlign:'center'}}><h2>Active Cycles</h2></Card.Header>
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
                <h2 style={{textAlign:'center'}}>Closed Cycles</h2>
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
              <Form.Control name="cycleName" placeholder="Cycle Name" required/>
              <Form.Group controlId="formBasicChecbox">
              <Form.Check type="checkbox" name = "migrateCheck" label="Migrate From Previous Cycles" id="custom-checkbox" 
                onChange={this.migrateSelect.bind(this)}/>
                </Form.Group>
                {this.state.migrate ?
                  <select id="cycleSelect" name="cycleSelect">
                    {cyclesOptions}
                  </select>
                : null}
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

        <Modal show={this.state.cycleClose} onHide={this.cycleCloseHide} centered>
          <Modal.Header closeButton><h3>Confirm Cycle Close</h3></Modal.Header>
          <Modal.Body>
            After you close you can only view the contents of this cycle. 
            Changes cannot be made.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={this.cycleCloseHide}>Cancel</Button>
            <Button variant="success" onClick={this.endCycle}>Close Cycle</Button>
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
  errors:state.errors
});

export default connect(
  mapStateToProps,
  { getAssessmentCycles, createCycle, updateCycleName, deleteCycle, cycleMigrate,closeCycle }
)(AssessmentCycle);
